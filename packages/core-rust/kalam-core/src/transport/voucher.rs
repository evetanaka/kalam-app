//! Payment vouchers for batch message settlement.
//!
//! Vouchers allow senders to commit to paying for a batch of messages.
//! They are signed with the sender's Ed25519 key and can be verified
//! by relays or settlement contracts.

use crate::types::SigningKey;
use crate::KalamError;
use ed25519_dalek::{Signer, Verifier};
use serde::{Deserialize, Serialize};

/// A signed payment voucher for batch message settlement.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Voucher {
    /// Sender's public key (Ed25519).
    pub sender: Vec<u8>,
    /// Number of messages covered by this voucher.
    pub message_count: u64,
    /// Epoch (batch period) for settlement.
    pub epoch: u64,
    /// Ed25519 signature over (sender || message_count || epoch).
    pub signature: Vec<u8>,
}

/// Create a signed payment voucher.
///
/// The `sender_key` must be a 32-byte Ed25519 seed.
pub fn create_voucher(
    sender_key: &SigningKey,
    message_count: u64,
    epoch: u64,
) -> Result<Voucher, KalamError> {
    let seed: [u8; 32] = sender_key
        .as_bytes()
        .try_into()
        .map_err(|_| KalamError::Economy("Invalid signing key length (need 32 bytes)".into()))?;

    let signing = ed25519_dalek::SigningKey::from_bytes(&seed);
    let public = signing.verifying_key();

    let msg = voucher_message(&public.to_bytes(), message_count, epoch);
    let sig = signing.sign(&msg);

    Ok(Voucher {
        sender: public.to_bytes().to_vec(),
        message_count,
        epoch,
        signature: sig.to_bytes().to_vec(),
    })
}

/// Verify a voucher's signature against a sender's public key.
pub fn verify_voucher(voucher: &Voucher, sender_public_key: &[u8]) -> Result<bool, KalamError> {
    let pub_bytes: [u8; 32] = sender_public_key
        .try_into()
        .map_err(|_| KalamError::Economy("Invalid public key length".into()))?;

    let verifying_key = ed25519_dalek::VerifyingKey::from_bytes(&pub_bytes)
        .map_err(|e| KalamError::Economy(format!("Invalid public key: {e}")))?;

    let sig_bytes: [u8; 64] = voucher
        .signature
        .as_slice()
        .try_into()
        .map_err(|_| KalamError::Economy("Invalid signature length".into()))?;

    let signature = ed25519_dalek::Signature::from_bytes(&sig_bytes);
    let msg = voucher_message(&pub_bytes, voucher.message_count, voucher.epoch);

    Ok(verifying_key.verify(&msg, &signature).is_ok())
}

/// Build the canonical message bytes for signing/verification.
fn voucher_message(sender: &[u8], message_count: u64, epoch: u64) -> Vec<u8> {
    let mut msg = Vec::with_capacity(sender.len() + 16);
    msg.extend_from_slice(sender);
    msg.extend_from_slice(&message_count.to_le_bytes());
    msg.extend_from_slice(&epoch.to_le_bytes());
    msg
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_signing_key() -> SigningKey {
        use rand::RngCore;
        let mut seed = vec![0u8; 32];
        rand::thread_rng().fill_bytes(&mut seed);
        SigningKey::new(seed)
    }

    #[test]
    fn test_create_and_verify_voucher() {
        let key = test_signing_key();
        let voucher = create_voucher(&key, 100, 5).unwrap();

        assert_eq!(voucher.message_count, 100);
        assert_eq!(voucher.epoch, 5);
        assert!(verify_voucher(&voucher, &voucher.sender).unwrap());
    }

    #[test]
    fn test_wrong_key_fails() {
        let key = test_signing_key();
        let voucher = create_voucher(&key, 10, 1).unwrap();

        let other_key = test_signing_key();
        let other_signing = ed25519_dalek::SigningKey::from_bytes(
            &<[u8; 32]>::try_from(other_key.as_bytes()).unwrap(),
        );
        let other_pub = other_signing.verifying_key().to_bytes().to_vec();

        assert!(!verify_voucher(&voucher, &other_pub).unwrap());
    }

    #[test]
    fn test_invalid_key_length() {
        let key = SigningKey::new(vec![1, 2, 3]); // too short
        assert!(create_voucher(&key, 1, 1).is_err());
    }
}
