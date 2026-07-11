//! Sealed sender — blind envelopes that hide the sender's identity from relays.
//!
//! The sender encrypts their identity inside the envelope using an ephemeral
//! X25519 key exchange with the recipient's public key. Only the recipient
//! can unseal the envelope to discover the sender.

use super::keys::{generate_identity_key, KeyPair};
use crate::KalamError;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce,
};
use hkdf::Hkdf;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::Sha256;

/// A sealed envelope that hides the sender's identity.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SealedEnvelope {
    /// Encrypted sender identity (AES-256-GCM).
    pub encrypted_sender: Vec<u8>,
    /// Ephemeral public key used for the DH exchange.
    pub ephemeral_key: Vec<u8>,
    /// The encrypted message payload.
    pub payload: Vec<u8>,
    /// Nonce for the sender identity encryption.
    nonce: Vec<u8>,
}

/// Seal a message, hiding the sender's identity from relays.
///
/// Creates an ephemeral key pair, performs DH with the recipient's public key,
/// and encrypts the sender ID alongside the ciphertext payload.
pub fn seal_message(
    sender_id: &[u8],
    recipient_public_key: &[u8],
    ciphertext: &[u8],
) -> Result<SealedEnvelope, KalamError> {
    let ephemeral = generate_identity_key()?;
    let dh_secret = ephemeral.dh(recipient_public_key)?;

    // Derive encryption key via HKDF
    let hk = Hkdf::<Sha256>::new(None, &dh_secret);
    let mut seal_key = [0u8; 32];
    hk.expand(b"kalam-sealed-sender", &mut seal_key)
        .map_err(|e| KalamError::Crypto(format!("Sealed HKDF failed: {e}")))?;

    // Encrypt sender_id
    let cipher = Aes256Gcm::new_from_slice(&seal_key)
        .map_err(|e| KalamError::Crypto(format!("AES key: {e}")))?;
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let encrypted_sender = cipher
        .encrypt(nonce, Payload { msg: sender_id, aad: b"sealed-sender" })
        .map_err(|e| KalamError::Crypto(format!("Seal encrypt: {e}")))?;

    Ok(SealedEnvelope {
        encrypted_sender,
        ephemeral_key: ephemeral.public_key.clone(),
        payload: ciphertext.to_vec(),
        nonce: nonce_bytes.to_vec(),
    })
}

/// Unseal a message, recovering the sender's identity.
///
/// Returns `(sender_id, ciphertext_payload)`.
pub fn unseal_message(
    recipient_key: &KeyPair,
    envelope: &SealedEnvelope,
) -> Result<(Vec<u8>, Vec<u8>), KalamError> {
    let dh_secret = recipient_key.dh(&envelope.ephemeral_key)?;

    let hk = Hkdf::<Sha256>::new(None, &dh_secret);
    let mut seal_key = [0u8; 32];
    hk.expand(b"kalam-sealed-sender", &mut seal_key)
        .map_err(|e| KalamError::Crypto(format!("Unseal HKDF: {e}")))?;

    let cipher = Aes256Gcm::new_from_slice(&seal_key)
        .map_err(|e| KalamError::Crypto(format!("AES key: {e}")))?;
    let nonce = Nonce::from_slice(&envelope.nonce);

    let sender_id = cipher
        .decrypt(nonce, Payload { msg: &envelope.encrypted_sender, aad: b"sealed-sender" })
        .map_err(|e| KalamError::Crypto(format!("Unseal decrypt: {e}")))?;

    Ok((sender_id, envelope.payload.clone()))
}

/// Pad a message to a multiple of `block_size` to hide its true length.
///
/// Uses PKCS#7-style padding: appends N bytes of value N.
pub fn pad_message(message: &[u8], block_size: usize) -> Vec<u8> {
    let block_size = block_size.max(1);
    let pad_len = block_size - (message.len() % block_size);
    let mut padded = Vec::with_capacity(message.len() + pad_len);
    padded.extend_from_slice(message);
    padded.resize(message.len() + pad_len, pad_len as u8);
    padded
}

/// Remove padding from a padded message.
pub fn unpad_message(padded: &[u8]) -> Result<Vec<u8>, KalamError> {
    if padded.is_empty() {
        return Err(KalamError::Crypto("Empty padded message".into()));
    }
    let pad_len = *padded.last().unwrap_or(&0) as usize;
    if pad_len == 0 || pad_len > padded.len() {
        return Err(KalamError::Crypto("Invalid padding".into()));
    }
    // Verify all padding bytes
    if padded[padded.len() - pad_len..].iter().any(|&b| b as usize != pad_len) {
        return Err(KalamError::Crypto("Invalid padding bytes".into()));
    }
    Ok(padded[..padded.len() - pad_len].to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_seal_unseal_roundtrip() {
        let recipient = generate_identity_key().unwrap();
        let sender_id = b"alice-id-12345";
        let ciphertext = b"encrypted-message-content";

        let envelope = seal_message(sender_id, &recipient.public_key, ciphertext).unwrap();
        let (recovered_sender, recovered_ct) = unseal_message(&recipient, &envelope).unwrap();

        assert_eq!(recovered_sender, sender_id);
        assert_eq!(recovered_ct, ciphertext);
    }

    #[test]
    fn test_wrong_recipient_fails() {
        let recipient = generate_identity_key().unwrap();
        let wrong_key = generate_identity_key().unwrap();

        let envelope = seal_message(b"alice", &recipient.public_key, b"msg").unwrap();
        assert!(unseal_message(&wrong_key, &envelope).is_err());
    }

    #[test]
    fn test_pad_unpad() {
        let msg = b"hello world";
        let padded = pad_message(msg, 16);
        assert_eq!(padded.len() % 16, 0);
        let unpadded = unpad_message(&padded).unwrap();
        assert_eq!(unpadded, msg);
    }

    #[test]
    fn test_pad_exact_block() {
        let msg = vec![0u8; 16];
        let padded = pad_message(&msg, 16);
        assert_eq!(padded.len(), 32); // Full block of padding added
        let unpadded = unpad_message(&padded).unwrap();
        assert_eq!(unpadded, msg);
    }

    #[test]
    fn test_unpad_empty() {
        assert!(unpad_message(&[]).is_err());
    }
}
