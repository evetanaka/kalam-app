//! Double Ratchet protocol for forward-secret message encryption.
//!
//! After an X3DH handshake establishes a shared secret, the Double Ratchet
//! provides per-message forward secrecy and break-in recovery via symmetric
//! key ratcheting combined with periodic DH ratchet steps.
//!
//! See: <https://signal.org/docs/specifications/doubleratchet/>

use super::keys::{generate_identity_key, KeyPair};
use crate::KalamError;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use hkdf::Hkdf;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::collections::HashMap;
use zeroize::{Zeroize, ZeroizeOnDrop};

/// Maximum number of skipped message keys to store (DoS protection).
const MAX_SKIP: u32 = 1000;

/// The full state of a Double Ratchet session.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct RatchetState {
    /// Root key (32 bytes), updated on each DH ratchet step.
    pub root_key: Vec<u8>,
    /// Sending chain key, stepped for each outgoing message.
    pub sending_chain_key: Vec<u8>,
    /// Receiving chain key, stepped for each incoming message.
    pub receiving_chain_key: Vec<u8>,
    /// Our current sending ratchet key pair (DH).
    #[zeroize(skip)]
    sending_ratchet_key: Option<KeyPair>,
    /// Their current ratchet public key.
    #[zeroize(skip)]
    pub receiving_ratchet_key: Vec<u8>,
    /// Counter of messages sent in the current sending chain.
    #[zeroize(skip)]
    pub message_number: u32,
    /// Counter of messages received in the current receiving chain.
    #[zeroize(skip)]
    pub recv_message_number: u32,
    /// Length of the previous sending chain (sent in message headers).
    #[zeroize(skip)]
    pub previous_chain_length: u32,
    /// Skipped message keys for out-of-order delivery.
    #[zeroize(skip)]
    skipped_keys: HashMap<(Vec<u8>, u32), Vec<u8>>,
}

impl std::fmt::Debug for RatchetState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RatchetState")
            .field("message_number", &self.message_number)
            .field("previous_chain_length", &self.previous_chain_length)
            .finish()
    }
}

/// A ratchet-encrypted message with its header.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RatchetMessage {
    /// Message header (sent in the clear, authenticated via AD).
    pub header: MessageHeader,
    /// AES-256-GCM ciphertext.
    pub ciphertext: Vec<u8>,
    /// AES-256-GCM nonce (12 bytes).
    pub nonce: Vec<u8>,
}

/// Header of a ratchet message.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageHeader {
    /// Sender's current DH ratchet public key.
    pub dh_public_key: Vec<u8>,
    /// Number of messages in the previous sending chain.
    pub prev_chain_len: u32,
    /// Message number within the current chain.
    pub message_number: u32,
}

/// A skipped message key, stored for out-of-order delivery.
#[derive(Debug, Clone)]
pub struct SkippedMessageKey {
    /// The DH ratchet public key that was active.
    pub ratchet_key: Vec<u8>,
    /// The message number.
    pub message_number: u32,
    /// The message key.
    pub message_key: Vec<u8>,
}

/// KDF for root key ratchet: (root_key, dh_output) → (new_root_key, chain_key).
fn kdf_rk(root_key: &[u8], dh_output: &[u8]) -> Result<(Vec<u8>, Vec<u8>), KalamError> {
    let hk = Hkdf::<Sha256>::new(Some(root_key), dh_output);
    let mut okm = [0u8; 64];
    hk.expand(b"kalam-ratchet-rk", &mut okm)
        .map_err(|e| KalamError::Crypto(format!("RK KDF failed: {e}")))?;
    Ok((okm[..32].to_vec(), okm[32..].to_vec()))
}

/// KDF for chain key step: chain_key → (new_chain_key, message_key).
fn kdf_ck(chain_key: &[u8]) -> Result<(Vec<u8>, Vec<u8>), KalamError> {
    let hk = Hkdf::<Sha256>::new(None, chain_key);
    let mut mk = [0u8; 32];
    let mut ck = [0u8; 32];
    hk.expand(b"kalam-ratchet-mk", &mut mk)
        .map_err(|e| KalamError::Crypto(format!("MK KDF failed: {e}")))?;
    hk.expand(b"kalam-ratchet-ck", &mut ck)
        .map_err(|e| KalamError::Crypto(format!("CK KDF failed: {e}")))?;
    Ok((ck.to_vec(), mk.to_vec()))
}

/// Initialize a ratchet state as the sender (Alice after X3DH).
///
/// `shared_secret` is from the X3DH exchange, `their_ratchet_key` is Bob's
/// signed pre-key (used as initial ratchet public key).
pub fn initialize_sender(
    shared_secret: &[u8],
    their_ratchet_key: &[u8],
) -> Result<RatchetState, KalamError> {
    let our_ratchet = generate_identity_key()?;
    let (root_key, sending_chain_key) =
        kdf_rk(shared_secret, &our_ratchet.dh(their_ratchet_key)?)?;

    Ok(RatchetState {
        root_key,
        sending_chain_key,
        receiving_chain_key: vec![],
        sending_ratchet_key: Some(our_ratchet),
        receiving_ratchet_key: their_ratchet_key.to_vec(),
        message_number: 0,
        recv_message_number: 0,
        previous_chain_length: 0,
        skipped_keys: HashMap::new(),
    })
}

/// Initialize a ratchet state as the receiver (Bob after X3DH).
///
/// `our_ratchet_key` is Bob's signed pre-key pair.
pub fn initialize_receiver(
    shared_secret: &[u8],
    our_ratchet_key: &KeyPair,
) -> Result<RatchetState, KalamError> {
    Ok(RatchetState {
        root_key: shared_secret.to_vec(),
        sending_chain_key: vec![],
        receiving_chain_key: vec![],
        sending_ratchet_key: Some(our_ratchet_key.clone()),
        receiving_ratchet_key: vec![],
        message_number: 0,
        recv_message_number: 0,
        previous_chain_length: 0,
        skipped_keys: HashMap::new(),
    })
}

/// Encrypt a plaintext message using the Double Ratchet.
///
/// Steps the sending chain key, derives a message key, and encrypts
/// with AES-256-GCM. The associated data `ad` is authenticated but not encrypted.
pub fn encrypt(
    state: &mut RatchetState,
    plaintext: &[u8],
    ad: &[u8],
) -> Result<RatchetMessage, KalamError> {
    let (new_ck, mut mk) = kdf_ck(&state.sending_chain_key)?;
    state.sending_chain_key = new_ck;

    let header = MessageHeader {
        dh_public_key: state
            .sending_ratchet_key
            .as_ref()
            .map(|k| k.public_key.clone())
            .unwrap_or_default(),
        prev_chain_len: state.previous_chain_length,
        message_number: state.message_number,
    };

    // Build full AD: external AD || serialized header
    let header_bytes =
        serde_json::to_vec(&header).map_err(|e| KalamError::Crypto(format!("Serialize: {e}")))?;
    let mut full_ad = ad.to_vec();
    full_ad.extend_from_slice(&header_bytes);

    let (ciphertext, nonce) = aes_gcm_encrypt(&mk, plaintext, &full_ad)?;
    mk.zeroize();

    state.message_number += 1;

    Ok(RatchetMessage {
        header,
        ciphertext,
        nonce,
    })
}

/// Decrypt a ratchet message, performing DH ratchet steps as needed.
///
/// Handles out-of-order messages by checking skipped message keys first,
/// then performing ratchet steps if the sender's DH key has changed.
pub fn decrypt(
    state: &mut RatchetState,
    message: &RatchetMessage,
    ad: &[u8],
) -> Result<Vec<u8>, KalamError> {
    // Check skipped keys first
    let key = (
        message.header.dh_public_key.clone(),
        message.header.message_number,
    );
    if let Some(mut mk) = state.skipped_keys.remove(&key) {
        let result = decrypt_with_key(&mk, message, ad);
        mk.zeroize();
        return result;
    }

    // DH ratchet step if the sender's key changed
    if message.header.dh_public_key != state.receiving_ratchet_key {
        skip_message_keys(state, message.header.prev_chain_len)?;
        dh_ratchet_step(state, &message.header.dh_public_key)?;
    }

    skip_message_keys(state, message.header.message_number)?;

    let (new_ck, mut mk) = kdf_ck(&state.receiving_chain_key)?;
    state.receiving_chain_key = new_ck;
    state.recv_message_number += 1;

    let result = decrypt_with_key(&mk, message, ad);
    mk.zeroize();
    result
}

/// Skip ahead in the receiving chain, storing message keys for later.
fn skip_message_keys(state: &mut RatchetState, until: u32) -> Result<(), KalamError> {
    if state.recv_message_number + MAX_SKIP < until {
        return Err(KalamError::Crypto(
            "Too many skipped messages".into(),
        ));
    }
    if state.receiving_chain_key.is_empty() {
        return Ok(());
    }
    while state.recv_message_number < until {
        let (new_ck, mk) = kdf_ck(&state.receiving_chain_key)?;
        state.receiving_chain_key = new_ck;
        state.skipped_keys.insert(
            (state.receiving_ratchet_key.clone(), state.recv_message_number),
            mk,
        );
        state.recv_message_number += 1;
    }
    Ok(())
}

/// Perform a DH ratchet step with a new remote public key.
fn dh_ratchet_step(state: &mut RatchetState, their_key: &[u8]) -> Result<(), KalamError> {
    state.previous_chain_length = state.message_number;
    state.message_number = 0;
    state.recv_message_number = 0;
    state.receiving_ratchet_key = their_key.to_vec();

    // Derive receiving chain key
    let dh_recv = state
        .sending_ratchet_key
        .as_ref()
        .ok_or_else(|| KalamError::Crypto("No sending ratchet key".into()))?
        .dh(their_key)?;
    let (rk, recv_ck) = kdf_rk(&state.root_key, &dh_recv)?;
    state.root_key = rk;
    state.receiving_chain_key = recv_ck;

    // Generate new sending ratchet key pair
    let new_ratchet = generate_identity_key()?;
    let dh_send = new_ratchet.dh(their_key)?;
    let (rk2, send_ck) = kdf_rk(&state.root_key, &dh_send)?;
    state.root_key = rk2;
    state.sending_chain_key = send_ck;
    state.sending_ratchet_key = Some(new_ratchet);

    Ok(())
}

/// Decrypt a message using a specific message key.
fn decrypt_with_key(
    mk: &[u8],
    message: &RatchetMessage,
    ad: &[u8],
) -> Result<Vec<u8>, KalamError> {
    let header_bytes = serde_json::to_vec(&message.header)
        .map_err(|e| KalamError::Crypto(format!("Serialize: {e}")))?;
    let mut full_ad = ad.to_vec();
    full_ad.extend_from_slice(&header_bytes);
    aes_gcm_decrypt(mk, &message.ciphertext, &message.nonce, &full_ad)
}

/// AES-256-GCM encrypt. Returns (ciphertext, nonce).
pub(crate) fn aes_gcm_encrypt(
    key: &[u8],
    plaintext: &[u8],
    ad: &[u8],
) -> Result<(Vec<u8>, Vec<u8>), KalamError> {
    use aes_gcm::aead::Payload;
    use rand::RngCore;

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| KalamError::Crypto(format!("AES key error: {e}")))?;
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let payload = Payload { msg: plaintext, aad: ad };
    let ciphertext = cipher
        .encrypt(nonce, payload)
        .map_err(|e| KalamError::Crypto(format!("AES encrypt failed: {e}")))?;

    Ok((ciphertext, nonce_bytes.to_vec()))
}

/// AES-256-GCM decrypt.
pub(crate) fn aes_gcm_decrypt(
    key: &[u8],
    ciphertext: &[u8],
    nonce: &[u8],
    ad: &[u8],
) -> Result<Vec<u8>, KalamError> {
    use aes_gcm::aead::Payload;

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| KalamError::Crypto(format!("AES key error: {e}")))?;
    let nonce = Nonce::from_slice(nonce);

    let payload = Payload { msg: ciphertext, aad: ad };
    cipher
        .decrypt(nonce, payload)
        .map_err(|e| KalamError::Crypto(format!("AES decrypt failed: {e}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let shared_secret = vec![42u8; 32];
        let bob_ratchet = generate_identity_key().unwrap();

        let mut alice_state =
            initialize_sender(&shared_secret, &bob_ratchet.public_key).unwrap();
        let mut bob_state = initialize_receiver(&shared_secret, &bob_ratchet).unwrap();

        let ad = b"associated-data";
        let plaintext = b"Hello, Bob!";

        let msg = encrypt(&mut alice_state, plaintext, ad).unwrap();
        let decrypted = decrypt(&mut bob_state, &msg, ad).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_multiple_messages() {
        let shared_secret = vec![7u8; 32];
        let bob_ratchet = generate_identity_key().unwrap();

        let mut alice = initialize_sender(&shared_secret, &bob_ratchet.public_key).unwrap();
        let mut bob = initialize_receiver(&shared_secret, &bob_ratchet).unwrap();

        let ad = b"ad";
        for i in 0..5 {
            let msg = encrypt(&mut alice, format!("msg-{i}").as_bytes(), ad).unwrap();
            let dec = decrypt(&mut bob, &msg, ad).unwrap();
            assert_eq!(dec, format!("msg-{i}").as_bytes());
        }
    }

    #[test]
    fn test_bidirectional_ratchet() {
        let shared_secret = vec![99u8; 32];
        let bob_ratchet = generate_identity_key().unwrap();

        let mut alice = initialize_sender(&shared_secret, &bob_ratchet.public_key).unwrap();
        let mut bob = initialize_receiver(&shared_secret, &bob_ratchet).unwrap();

        let ad = b"bidi";

        // Alice → Bob
        let m1 = encrypt(&mut alice, b"A->B 1", ad).unwrap();
        let d1 = decrypt(&mut bob, &m1, ad).unwrap();
        assert_eq!(d1, b"A->B 1");

        // Bob → Alice
        let m2 = encrypt(&mut bob, b"B->A 1", ad).unwrap();
        let d2 = decrypt(&mut alice, &m2, ad).unwrap();
        assert_eq!(d2, b"B->A 1");

        // Alice → Bob again
        let m3 = encrypt(&mut alice, b"A->B 2", ad).unwrap();
        let d3 = decrypt(&mut bob, &m3, ad).unwrap();
        assert_eq!(d3, b"A->B 2");
    }

    #[test]
    fn test_out_of_order_messages() {
        let shared_secret = vec![55u8; 32];
        let bob_ratchet = generate_identity_key().unwrap();

        let mut alice = initialize_sender(&shared_secret, &bob_ratchet.public_key).unwrap();
        let mut bob = initialize_receiver(&shared_secret, &bob_ratchet).unwrap();

        let ad = b"ooo";

        let m0 = encrypt(&mut alice, b"msg-0", ad).unwrap();
        let m1 = encrypt(&mut alice, b"msg-1", ad).unwrap();
        let m2 = encrypt(&mut alice, b"msg-2", ad).unwrap();

        // Decrypt out of order: m2, m0, m1
        let d2 = decrypt(&mut bob, &m2, ad).unwrap();
        assert_eq!(d2, b"msg-2");

        let d0 = decrypt(&mut bob, &m0, ad).unwrap();
        assert_eq!(d0, b"msg-0");

        let d1 = decrypt(&mut bob, &m1, ad).unwrap();
        assert_eq!(d1, b"msg-1");
    }
}
