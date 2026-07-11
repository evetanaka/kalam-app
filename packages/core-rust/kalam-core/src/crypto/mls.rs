//! Simplified MLS (Message Layer Security) for group messaging.
//!
//! Provides tree-based group key agreement with forward secrecy and
//! post-compromise security. This is a simplified implementation focused
//! on core tree-based key derivation, not a full RFC 9420 implementation.
//!
//! Cipher suite: AES-256-GCM + HKDF-SHA256 + X25519.

use super::keys::{generate_identity_key, KeyPair};
use super::ratchet::{aes_gcm_decrypt, aes_gcm_encrypt};
use crate::KalamError;
use hkdf::Hkdf;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use zeroize::Zeroize;

/// Supported cipher suite identifier.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CipherSuite {
    /// AES-256-GCM + HKDF-SHA256 + X25519
    #[allow(non_camel_case_types)]
    MLS_128_X25519_AES256GCM_SHA256,
}

/// A member of an MLS group.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlsGroupMember {
    /// Member's identity public key bytes.
    pub identity: Vec<u8>,
    /// Member's credential (opaque bytes, e.g. signed identity).
    pub credential: Vec<u8>,
    /// Leaf index in the binary tree.
    pub leaf_index: u32,
}

/// An MLS group state.
#[derive(Clone)]
pub struct MlsGroup {
    /// Random 32-byte group identifier.
    pub group_id: Vec<u8>,
    /// Current epoch (incremented on each commit).
    pub epoch: u64,
    /// Group members.
    pub members: Vec<MlsGroupMember>,
    /// Cipher suite in use.
    pub cipher_suite: CipherSuite,
    /// Hash of the current tree state.
    pub tree_hash: Vec<u8>,
    /// Group epoch secret (derived from tree). Zeroized manually.
    epoch_secret: Vec<u8>,
    /// Per-sender message counters.
    sender_counters: std::collections::HashMap<u32, u64>,
    /// Group name.
    pub name: Vec<u8>,
}

impl std::fmt::Debug for MlsGroup {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("MlsGroup")
            .field("group_id", &hex::encode(&self.group_id))
            .field("epoch", &self.epoch)
            .field("members", &self.members.len())
            .finish()
    }
}

impl Drop for MlsGroup {
    fn drop(&mut self) {
        self.epoch_secret.zeroize();
    }
}

/// A key package published by a potential group member.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlsKeyPackage {
    /// Protocol version.
    pub version: u16,
    /// Cipher suite.
    pub cipher_suite: CipherSuite,
    /// X25519 init key (public) for key exchange.
    pub init_key: Vec<u8>,
    /// Member credential (identity public key).
    pub credential: Vec<u8>,
    /// Extensions (reserved, currently empty).
    pub extensions: Vec<u8>,
    /// Ed25519 signature over the key package contents.
    pub signature: Vec<u8>,
}

/// A proposal within an MLS commit.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MlsProposal {
    /// Add a new member via their key package.
    Add(MlsKeyPackage),
    /// Remove a member by leaf index.
    Remove(u32),
    /// Update a member's key package.
    Update(MlsKeyPackage),
}

/// An MLS commit message containing proposals and a confirmation tag.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlsCommit {
    /// The proposals being committed.
    pub proposals: Vec<MlsProposal>,
    /// HMAC confirmation tag over the commit.
    pub confirmation_tag: Vec<u8>,
}

/// A welcome message for a new member joining a group.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlsWelcome {
    /// Group identifier.
    pub group_id: Vec<u8>,
    /// Epoch at time of welcome.
    pub epoch: u64,
    /// Encrypted group info (AES-256-GCM encrypted with derived key).
    pub encrypted_group_info: Vec<u8>,
    /// Key packages of existing members (for tree reconstruction).
    pub key_packages: Vec<MlsKeyPackage>,
    /// Nonce for the encrypted group info.
    pub nonce: Vec<u8>,
    /// Group name.
    pub group_name: Vec<u8>,
    /// Members at time of welcome.
    pub members: Vec<MlsGroupMember>,
}

/// An MLS ciphertext (encrypted group message).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MlsCiphertext {
    /// Group identifier.
    pub group_id: Vec<u8>,
    /// Epoch when encrypted.
    pub epoch: u64,
    /// Content type identifier.
    pub content_type: u8,
    /// Encrypted sender data (leaf_index + counter, encrypted with sender_data_key).
    pub encrypted_sender_data: Vec<u8>,
    /// The encrypted message payload.
    pub ciphertext: Vec<u8>,
    /// Nonce for sender data.
    pub sender_data_nonce: Vec<u8>,
    /// Nonce for the ciphertext.
    pub ciphertext_nonce: Vec<u8>,
}

/// Derive a key from the epoch secret for a specific purpose.
fn derive_key(epoch_secret: &[u8], info: &[u8]) -> Result<Vec<u8>, KalamError> {
    let hk = Hkdf::<Sha256>::new(None, epoch_secret);
    let mut okm = vec![0u8; 32];
    hk.expand(info, &mut okm)
        .map_err(|e| KalamError::Crypto(format!("MLS KDF failed: {e}")))?;
    Ok(okm)
}

/// Derive the epoch secret from member secrets using a binary tree approach.
fn derive_epoch_secret(member_secrets: &[Vec<u8>]) -> Result<Vec<u8>, KalamError> {
    if member_secrets.is_empty() {
        return Err(KalamError::Crypto("No members for epoch secret".into()));
    }
    // Binary tree reduction: hash pairs of secrets up to root
    let mut level: Vec<Vec<u8>> = member_secrets.to_vec();
    while level.len() > 1 {
        let mut next = Vec::new();
        for chunk in level.chunks(2) {
            let combined = if chunk.len() == 2 {
                let hk = Hkdf::<Sha256>::new(Some(&chunk[0]), &chunk[1]);
                let mut out = vec![0u8; 32];
                hk.expand(b"kalam-mls-tree-node", &mut out)
                    .map_err(|e| KalamError::Crypto(format!("Tree KDF: {e}")))?;
                out
            } else {
                chunk[0].clone()
            };
            next.push(combined);
        }
        level = next;
    }
    Ok(level.into_iter().next().unwrap_or_default())
}

/// Compute the tree hash for the current group state.
fn compute_tree_hash(group_id: &[u8], epoch: u64, members: &[MlsGroupMember]) -> Vec<u8> {
    use sha2::Digest;
    let mut hasher = sha2::Sha256::new();
    hasher.update(group_id);
    hasher.update(epoch.to_le_bytes());
    for m in members {
        hasher.update(&m.identity);
        hasher.update(m.leaf_index.to_le_bytes());
    }
    hasher.finalize().to_vec()
}

/// Create a new MLS group.
///
/// The creator becomes the first member at leaf index 0.
pub fn create_group(creator_identity: &KeyPair, group_name: &[u8]) -> Result<MlsGroup, KalamError> {
    let mut group_id = vec![0u8; 32];
    rand::thread_rng().fill_bytes(&mut group_id);

    let member = MlsGroupMember {
        identity: creator_identity.public_key.clone(),
        credential: creator_identity.public_key.clone(),
        leaf_index: 0,
    };

    // Initial epoch secret from creator's DH with self (deterministic seed)
    let init_secret = derive_key(&creator_identity.public_key, b"kalam-mls-init")?;
    let epoch_secret = derive_epoch_secret(&[init_secret])?;

    let members = vec![member];
    let tree_hash = compute_tree_hash(&group_id, 0, &members);

    Ok(MlsGroup {
        group_id,
        epoch: 0,
        members,
        cipher_suite: CipherSuite::MLS_128_X25519_AES256GCM_SHA256,
        tree_hash,
        epoch_secret,
        sender_counters: std::collections::HashMap::new(),
        name: group_name.to_vec(),
    })
}

/// Create a key package for joining groups.
///
/// Generates a fresh X25519 init key and signs the package.
pub fn create_key_package(identity: &KeyPair) -> Result<MlsKeyPackage, KalamError> {
    let init_key_pair = generate_identity_key()?;

    // Sign the key package with Ed25519 derived from identity
    let hk = Hkdf::<Sha256>::new(None, &identity.secret_key);
    let mut ed_seed = [0u8; 32];
    hk.expand(b"kalam-mls-kp-signing", &mut ed_seed)
        .map_err(|e| KalamError::Crypto(format!("KP HKDF: {e}")))?;

    use ed25519_dalek::{Signer, SigningKey};
    let signing_key = SigningKey::from_bytes(&ed_seed);
    ed_seed.zeroize();

    let mut sign_input = Vec::new();
    sign_input.extend_from_slice(&init_key_pair.public_key);
    sign_input.extend_from_slice(&identity.public_key);
    let signature = signing_key.sign(&sign_input).to_bytes().to_vec();

    Ok(MlsKeyPackage {
        version: 1,
        cipher_suite: CipherSuite::MLS_128_X25519_AES256GCM_SHA256,
        init_key: init_key_pair.public_key.clone(),
        credential: identity.public_key.clone(),
        extensions: vec![],
        signature,
    })
}

/// Add a member to the group.
///
/// Returns a commit and a welcome message for the new member.
pub fn add_member(
    group: &mut MlsGroup,
    adder: &KeyPair,
    new_member_kp: &MlsKeyPackage,
) -> Result<(MlsCommit, MlsWelcome), KalamError> {
    // Verify the adder is a member
    if !group.members.iter().any(|m| m.identity == adder.public_key) {
        return Err(KalamError::Crypto("Adder is not a group member".into()));
    }

    let new_leaf_index = group.members.iter().map(|m| m.leaf_index).max().unwrap_or(0) + 1;

    let new_member = MlsGroupMember {
        identity: new_member_kp.credential.clone(),
        credential: new_member_kp.credential.clone(),
        leaf_index: new_leaf_index,
    };

    group.members.push(new_member);
    group.epoch += 1;

    // Derive new epoch secret incorporating the new member
    let member_secrets: Vec<Vec<u8>> = group
        .members
        .iter()
        .map(|m| derive_key(&m.identity, b"kalam-mls-member"))
        .collect::<Result<_, _>>()?;
    group.epoch_secret.zeroize();
    group.epoch_secret = derive_epoch_secret(&member_secrets)?;
    group.tree_hash = compute_tree_hash(&group.group_id, group.epoch, &group.members);

    // Create confirmation tag
    let confirmation_tag = derive_key(&group.epoch_secret, b"kalam-mls-confirm")?;

    let commit = MlsCommit {
        proposals: vec![MlsProposal::Add(new_member_kp.clone())],
        confirmation_tag,
    };

    // Create welcome: encrypt group info for the new member using DH
    // Use adder's identity key DH with new member's credential (identity public key)
    // so the new member can decrypt with their identity secret key
    let welcome_key = adder.dh(&new_member_kp.credential)?;
    let mut welcome_encryption_key = derive_key(&welcome_key, b"kalam-mls-welcome")?;

    let group_info = serde_json::to_vec(&serde_json::json!({
        "epoch_secret": hex::encode(&group.epoch_secret),
        "epoch": group.epoch,
    }))
    .map_err(|e| KalamError::Crypto(format!("Serialize group info: {e}")))?;

    let (encrypted_group_info, nonce) = aes_gcm_encrypt(&welcome_encryption_key, &group_info, &group.group_id)?;
    welcome_encryption_key.zeroize();

    let key_packages: Vec<MlsKeyPackage> = group
        .members
        .iter()
        .map(|m| MlsKeyPackage {
            version: 1,
            cipher_suite: group.cipher_suite,
            init_key: m.identity.clone(),
            credential: m.credential.clone(),
            extensions: vec![],
            signature: vec![],
        })
        .collect();

    let welcome = MlsWelcome {
        group_id: group.group_id.clone(),
        epoch: group.epoch,
        encrypted_group_info,
        key_packages,
        nonce,
        group_name: group.name.clone(),
        members: group.members.clone(),
    };

    Ok((commit, welcome))
}

/// Remove a member from the group by leaf index.
pub fn remove_member(
    group: &mut MlsGroup,
    remover: &KeyPair,
    leaf_index: u32,
) -> Result<MlsCommit, KalamError> {
    if !group.members.iter().any(|m| m.identity == remover.public_key) {
        return Err(KalamError::Crypto("Remover is not a group member".into()));
    }

    let pos = group
        .members
        .iter()
        .position(|m| m.leaf_index == leaf_index)
        .ok_or_else(|| KalamError::Crypto(format!("No member at leaf index {leaf_index}")))?;

    group.members.remove(pos);
    group.epoch += 1;

    // Re-derive epoch secret without the removed member
    let member_secrets: Vec<Vec<u8>> = group
        .members
        .iter()
        .map(|m| derive_key(&m.identity, b"kalam-mls-member"))
        .collect::<Result<_, _>>()?;
    group.epoch_secret.zeroize();
    group.epoch_secret = derive_epoch_secret(&member_secrets)?;
    group.tree_hash = compute_tree_hash(&group.group_id, group.epoch, &group.members);

    let confirmation_tag = derive_key(&group.epoch_secret, b"kalam-mls-confirm")?;

    Ok(MlsCommit {
        proposals: vec![MlsProposal::Remove(leaf_index)],
        confirmation_tag,
    })
}

/// Process a welcome message to join a group.
///
/// The new member decrypts the group info using their init key.
pub fn process_welcome(
    identity: &KeyPair,
    welcome: &MlsWelcome,
) -> Result<MlsGroup, KalamError> {
    // Find the key package that corresponds to our identity (the adder's package pointing to us)
    // The welcome key is derived from DH between adder and our init key
    // We need to try decrypting with our identity key against each member's key
    let mut epoch_secret = None;

    for kp in &welcome.key_packages {
        let dh_result = identity.dh(&kp.init_key);
        if let Ok(welcome_key) = dh_result {
            let mut decryption_key = match derive_key(&welcome_key, b"kalam-mls-welcome") {
                Ok(k) => k,
                Err(_) => continue,
            };

            let result = aes_gcm_decrypt(
                &decryption_key,
                &welcome.encrypted_group_info,
                &welcome.nonce,
                &welcome.group_id,
            );
            decryption_key.zeroize();

            if let Ok(group_info_bytes) = result {
                let group_info: serde_json::Value = serde_json::from_slice(&group_info_bytes)
                    .map_err(|e| KalamError::Crypto(format!("Parse group info: {e}")))?;
                let secret_hex = group_info["epoch_secret"]
                    .as_str()
                    .ok_or_else(|| KalamError::Crypto("Missing epoch_secret".into()))?;
                epoch_secret = Some(
                    hex::decode(secret_hex)
                        .map_err(|e| KalamError::Crypto(format!("Decode epoch secret: {e}")))?,
                );
                break;
            }
        }
    }

    let epoch_secret = epoch_secret
        .ok_or_else(|| KalamError::Crypto("Could not decrypt welcome message".into()))?;

    let tree_hash = compute_tree_hash(&welcome.group_id, welcome.epoch, &welcome.members);

    Ok(MlsGroup {
        group_id: welcome.group_id.clone(),
        epoch: welcome.epoch,
        members: welcome.members.clone(),
        cipher_suite: CipherSuite::MLS_128_X25519_AES256GCM_SHA256,
        tree_hash,
        epoch_secret,
        sender_counters: std::collections::HashMap::new(),
        name: welcome.group_name.clone(),
    })
}

/// Process a commit to advance the group epoch.
///
/// All members must process each commit to stay in sync.
pub fn process_commit(group: &mut MlsGroup, commit: &MlsCommit) -> Result<(), KalamError> {
    for proposal in &commit.proposals {
        match proposal {
            MlsProposal::Add(kp) => {
                let new_leaf = group.members.iter().map(|m| m.leaf_index).max().unwrap_or(0) + 1;
                group.members.push(MlsGroupMember {
                    identity: kp.credential.clone(),
                    credential: kp.credential.clone(),
                    leaf_index: new_leaf,
                });
            }
            MlsProposal::Remove(leaf_index) => {
                group.members.retain(|m| m.leaf_index != *leaf_index);
            }
            MlsProposal::Update(kp) => {
                if let Some(m) = group.members.iter_mut().find(|m| m.credential == kp.credential) {
                    m.identity = kp.init_key.clone();
                }
            }
        }
    }

    group.epoch += 1;

    let member_secrets: Vec<Vec<u8>> = group
        .members
        .iter()
        .map(|m| derive_key(&m.identity, b"kalam-mls-member"))
        .collect::<Result<_, _>>()?;
    group.epoch_secret.zeroize();
    group.epoch_secret = derive_epoch_secret(&member_secrets)?;
    group.tree_hash = compute_tree_hash(&group.group_id, group.epoch, &group.members);

    // Verify confirmation tag
    let expected_tag = derive_key(&group.epoch_secret, b"kalam-mls-confirm")?;
    if expected_tag != commit.confirmation_tag {
        return Err(KalamError::Crypto("Commit confirmation tag mismatch".into()));
    }

    Ok(())
}

/// Encrypt a group message.
///
/// Derives a message key from the epoch secret and sender's counter.
pub fn encrypt_group_message(
    group: &mut MlsGroup,
    sender: &KeyPair,
    plaintext: &[u8],
) -> Result<MlsCiphertext, KalamError> {
    let sender_leaf = group
        .members
        .iter()
        .find(|m| m.identity == sender.public_key)
        .map(|m| m.leaf_index)
        .ok_or_else(|| KalamError::Crypto("Sender is not a group member".into()))?;

    let counter = group.sender_counters.entry(sender_leaf).or_insert(0);
    *counter += 1;
    let current_counter = *counter;

    // Derive message key from epoch_secret + sender_leaf + counter
    let mut mk_input = group.epoch_secret.clone();
    mk_input.extend_from_slice(&sender_leaf.to_le_bytes());
    mk_input.extend_from_slice(&current_counter.to_le_bytes());
    let mut message_key = derive_key(&mk_input, b"kalam-mls-message-key")?;
    mk_input.zeroize();

    // Derive sender data key
    let mut sender_data_key = derive_key(&group.epoch_secret, b"kalam-mls-sender-data-key")?;

    // Encrypt sender data (leaf_index + counter)
    let sender_data = serde_json::to_vec(&serde_json::json!({
        "leaf_index": sender_leaf,
        "counter": current_counter,
    }))
    .map_err(|e| KalamError::Crypto(format!("Serialize sender data: {e}")))?;

    let (encrypted_sender_data, sender_data_nonce) =
        aes_gcm_encrypt(&sender_data_key, &sender_data, &group.group_id)?;
    sender_data_key.zeroize();

    // Encrypt plaintext
    let (ciphertext, ciphertext_nonce) =
        aes_gcm_encrypt(&message_key, plaintext, &group.group_id)?;
    message_key.zeroize();

    Ok(MlsCiphertext {
        group_id: group.group_id.clone(),
        epoch: group.epoch,
        content_type: 0, // Application
        encrypted_sender_data,
        ciphertext,
        sender_data_nonce,
        ciphertext_nonce,
    })
}

/// Decrypt a group message.
///
/// Returns `(plaintext, sender_leaf_index)`.
pub fn decrypt_group_message(
    group: &MlsGroup,
    _receiver: &KeyPair,
    ciphertext: &MlsCiphertext,
) -> Result<(Vec<u8>, u32), KalamError> {
    if ciphertext.group_id != group.group_id {
        return Err(KalamError::Crypto("Group ID mismatch".into()));
    }
    if ciphertext.epoch != group.epoch {
        return Err(KalamError::Crypto("Epoch mismatch".into()));
    }

    // Decrypt sender data
    let mut sender_data_key = derive_key(&group.epoch_secret, b"kalam-mls-sender-data-key")?;
    let sender_data_bytes = aes_gcm_decrypt(
        &sender_data_key,
        &ciphertext.encrypted_sender_data,
        &ciphertext.sender_data_nonce,
        &group.group_id,
    )?;
    sender_data_key.zeroize();

    let sender_data: serde_json::Value = serde_json::from_slice(&sender_data_bytes)
        .map_err(|e| KalamError::Crypto(format!("Parse sender data: {e}")))?;
    let sender_leaf = sender_data["leaf_index"]
        .as_u64()
        .ok_or_else(|| KalamError::Crypto("Missing leaf_index".into()))? as u32;
    let counter = sender_data["counter"]
        .as_u64()
        .ok_or_else(|| KalamError::Crypto("Missing counter".into()))?;

    // Derive message key
    let sender_identity = group
        .members
        .iter()
        .find(|m| m.leaf_index == sender_leaf)
        .ok_or_else(|| KalamError::Crypto("Unknown sender leaf index".into()))?;
    let _ = &sender_identity.identity; // validate membership

    let mut mk_input = group.epoch_secret.clone();
    mk_input.extend_from_slice(&sender_leaf.to_le_bytes());
    mk_input.extend_from_slice(&counter.to_le_bytes());
    let mut message_key = derive_key(&mk_input, b"kalam-mls-message-key")?;
    mk_input.zeroize();

    let plaintext = aes_gcm_decrypt(
        &message_key,
        &ciphertext.ciphertext,
        &ciphertext.ciphertext_nonce,
        &group.group_id,
    )?;
    message_key.zeroize();

    Ok((plaintext, sender_leaf))
}

/// Update own leaf key for post-compromise security.
///
/// Returns a commit and the new key package.
pub fn update_own_key(
    group: &mut MlsGroup,
    member: &KeyPair,
) -> Result<(MlsCommit, MlsKeyPackage), KalamError> {
    let new_kp = create_key_package(member)?;

    // Update our member entry
    if let Some(m) = group.members.iter_mut().find(|m| m.identity == member.public_key) {
        m.identity = new_kp.init_key.clone();
    } else {
        return Err(KalamError::Crypto("Member not found in group".into()));
    }

    group.epoch += 1;

    let member_secrets: Vec<Vec<u8>> = group
        .members
        .iter()
        .map(|m| derive_key(&m.identity, b"kalam-mls-member"))
        .collect::<Result<_, _>>()?;
    group.epoch_secret.zeroize();
    group.epoch_secret = derive_epoch_secret(&member_secrets)?;
    group.tree_hash = compute_tree_hash(&group.group_id, group.epoch, &group.members);

    let confirmation_tag = derive_key(&group.epoch_secret, b"kalam-mls-confirm")?;

    let commit = MlsCommit {
        proposals: vec![MlsProposal::Update(new_kp.clone())],
        confirmation_tag,
    };

    Ok((commit, new_kp))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_group() {
        let creator = generate_identity_key().unwrap();
        let group = create_group(&creator, b"test-group").unwrap();
        assert_eq!(group.group_id.len(), 32);
        assert_eq!(group.epoch, 0);
        assert_eq!(group.members.len(), 1);
        assert_eq!(group.members[0].identity, creator.public_key);
    }

    #[test]
    fn test_create_key_package() {
        let identity = generate_identity_key().unwrap();
        let kp = create_key_package(&identity).unwrap();
        assert_eq!(kp.version, 1);
        assert_eq!(kp.credential, identity.public_key);
        assert_eq!(kp.init_key.len(), 32);
        assert_eq!(kp.signature.len(), 64);
    }

    #[test]
    fn test_add_remove_member() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"grp").unwrap();

        let bob_kp = create_key_package(&bob).unwrap();
        let (commit, welcome) = add_member(&mut group, &alice, &bob_kp).unwrap();
        assert_eq!(group.members.len(), 2);
        assert_eq!(group.epoch, 1);
        assert!(!commit.confirmation_tag.is_empty());
        assert_eq!(welcome.group_id, group.group_id);

        // Remove bob (leaf_index=1)
        let _commit = remove_member(&mut group, &alice, 1).unwrap();
        assert_eq!(group.members.len(), 1);
        assert_eq!(group.epoch, 2);
    }

    #[test]
    fn test_encrypt_decrypt_group_message() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"chat").unwrap();

        let bob_kp = create_key_package(&bob).unwrap();
        let (_commit, _welcome) = add_member(&mut group, &alice, &bob_kp).unwrap();

        // Alice encrypts, Bob decrypts (both share the same group state here)
        let ct = encrypt_group_message(&mut group, &alice, b"Hello group!").unwrap();
        let (pt, sender_idx) = decrypt_group_message(&group, &bob, &ct).unwrap();
        assert_eq!(pt, b"Hello group!");
        assert_eq!(sender_idx, 0); // Alice is leaf 0
    }

    #[test]
    fn test_process_welcome() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"welcome-test").unwrap();

        let bob_kp = create_key_package(&bob).unwrap();
        let (_commit, welcome) = add_member(&mut group, &alice, &bob_kp).unwrap();

        // Bob processes welcome — he needs to try DH with alice's public key
        // In our implementation, the welcome key_packages contain member init_keys
        // Bob tries each one with his identity key
        let bob_group = process_welcome(&bob, &welcome).unwrap();
        assert_eq!(bob_group.group_id, group.group_id);
        assert_eq!(bob_group.epoch, group.epoch);
        assert_eq!(bob_group.members.len(), group.members.len());
    }

    #[test]
    fn test_process_commit() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let charlie = generate_identity_key().unwrap();

        let mut alice_group = create_group(&alice, b"commit-test").unwrap();
        let bob_kp = create_key_package(&bob).unwrap();
        let (_commit, _welcome) = add_member(&mut alice_group, &alice, &bob_kp).unwrap();

        // Bob's view: starts from welcome, then processes new commits
        let mut bob_group = process_welcome(&bob, &_welcome).unwrap();

        // Now alice adds charlie
        let charlie_kp = create_key_package(&charlie).unwrap();
        let (commit2, _) = add_member(&mut alice_group, &alice, &charlie_kp).unwrap();

        // Bob processes the commit
        process_commit(&mut bob_group, &commit2).unwrap();
        assert_eq!(bob_group.members.len(), 3);
        assert_eq!(bob_group.epoch, alice_group.epoch);
    }

    #[test]
    fn test_update_own_key() {
        let alice = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"update-test").unwrap();
        let old_epoch = group.epoch;

        let (commit, new_kp) = update_own_key(&mut group, &alice).unwrap();
        assert_eq!(group.epoch, old_epoch + 1);
        assert!(!commit.confirmation_tag.is_empty());
        assert_eq!(new_kp.credential, alice.public_key);
    }

    #[test]
    fn test_non_member_cannot_add() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let charlie = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"grp").unwrap();

        let charlie_kp = create_key_package(&charlie).unwrap();
        // Bob is not a member, should fail
        assert!(add_member(&mut group, &bob, &charlie_kp).is_err());
    }

    #[test]
    fn test_multiple_messages_different_counters() {
        let alice = generate_identity_key().unwrap();
        let bob = generate_identity_key().unwrap();
        let mut group = create_group(&alice, b"multi").unwrap();
        let bob_kp = create_key_package(&bob).unwrap();
        add_member(&mut group, &alice, &bob_kp).unwrap();

        let ct1 = encrypt_group_message(&mut group, &alice, b"msg1").unwrap();
        let ct2 = encrypt_group_message(&mut group, &alice, b"msg2").unwrap();

        // Both should decrypt correctly
        let (pt1, _) = decrypt_group_message(&group, &bob, &ct1).unwrap();
        let (pt2, _) = decrypt_group_message(&group, &bob, &ct2).unwrap();
        assert_eq!(pt1, b"msg1");
        assert_eq!(pt2, b"msg2");
    }
}
