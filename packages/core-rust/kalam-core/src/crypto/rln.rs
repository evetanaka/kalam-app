//! Rate Limiting Nullifiers (RLN) — simplified algebraic core.
//!
//! RLN allows proving membership in a group and rate-limiting messages per epoch
//! without revealing identity. If a user sends more than one message per epoch,
//! their identity secret can be recovered (slashing).
//!
//! This is a simplified implementation of the algebraic core. A production
//! version would use circom/snarkjs for zero-knowledge proofs.

use crate::KalamError;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// A simplified RLN proof.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RLNProof {
    /// Nullifier: H(identity_secret, epoch) — unique per (user, epoch).
    pub nullifier: Vec<u8>,
    /// Shamir share x-coordinate (derived from message hash).
    pub share_x: Vec<u8>,
    /// Shamir share y-coordinate: y = identity_secret + x * identity_secret_hash.
    pub share_y: Vec<u8>,
    /// The epoch this proof is valid for.
    pub epoch: u64,
    /// Merkle proof of membership (simplified: hash of identity commitment).
    pub merkle_proof: Vec<u8>,
}

/// Generate a simplified RLN proof for a message in a given epoch.
///
/// The proof reveals a Shamir share of the identity secret. Two shares
/// (from two messages in the same epoch) allow recovering the secret.
pub fn generate_rln_proof(
    identity_secret: &[u8],
    epoch: u64,
    message_hash: &[u8],
) -> Result<RLNProof, KalamError> {
    if identity_secret.is_empty() {
        return Err(KalamError::Crypto("Empty identity secret".into()));
    }

    // nullifier = H(identity_secret || epoch)
    let nullifier = {
        let mut hasher = Sha256::new();
        hasher.update(identity_secret);
        hasher.update(epoch.to_le_bytes());
        hasher.finalize().to_vec()
    };

    // identity_commitment = H(identity_secret)
    let id_commitment = Sha256::digest(identity_secret).to_vec();

    // share_x = H(message_hash || epoch) — unique per message
    let share_x = {
        let mut hasher = Sha256::new();
        hasher.update(message_hash);
        hasher.update(epoch.to_le_bytes());
        hasher.finalize().to_vec()
    };

    // share_y = H(identity_secret || share_x)
    // Simplified: in real RLN this is a polynomial evaluation over a finite field
    let share_y = {
        let mut hasher = Sha256::new();
        hasher.update(identity_secret);
        hasher.update(&share_x);
        hasher.finalize().to_vec()
    };

    // merkle_proof = identity_commitment (simplified)
    let merkle_proof = id_commitment;

    Ok(RLNProof {
        nullifier,
        share_x,
        share_y,
        epoch,
        merkle_proof,
    })
}

/// Verify a simplified RLN proof against a merkle root.
///
/// Checks that the merkle proof is consistent with the claimed root.
pub fn verify_rln_proof(proof: &RLNProof, merkle_root: &[u8]) -> Result<bool, KalamError> {
    if proof.nullifier.is_empty() || proof.share_x.is_empty() || proof.share_y.is_empty() {
        return Ok(false);
    }
    // Simplified: check that merkle_proof matches root
    // In production, this would verify a Merkle path
    Ok(proof.merkle_proof == merkle_root)
}

/// Detect spam by checking if two proofs from the same epoch reveal the identity secret.
///
/// If two different messages were sent in the same epoch by the same user,
/// their Shamir shares can be used to recover the identity secret.
/// Returns `Some(identity_secret_hash)` if spam is detected, `None` otherwise.
pub fn detect_spam(proof1: &RLNProof, proof2: &RLNProof) -> Option<Vec<u8>> {
    // Must be same epoch and same nullifier (same user)
    if proof1.epoch != proof2.epoch || proof1.nullifier != proof2.nullifier {
        return None;
    }
    // Must be different messages (different share_x)
    if proof1.share_x == proof2.share_x {
        return None;
    }
    // In real RLN, we'd do polynomial interpolation to recover the secret.
    // Simplified: XOR the two share_y values as a "recovered secret indicator"
    let recovered: Vec<u8> = proof1
        .share_y
        .iter()
        .zip(proof2.share_y.iter())
        .map(|(a, b)| a ^ b)
        .collect();
    Some(recovered)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_verify_proof() {
        let secret = b"my-identity-secret";
        let proof = generate_rln_proof(secret, 42, b"hello").unwrap();
        assert!(!proof.nullifier.is_empty());
        assert_eq!(proof.epoch, 42);

        // Verify against correct merkle root (= identity commitment)
        let root = Sha256::digest(secret).to_vec();
        assert!(verify_rln_proof(&proof, &root).unwrap());

        // Wrong root fails
        assert!(!verify_rln_proof(&proof, b"wrong-root").unwrap());
    }

    #[test]
    fn test_detect_spam() {
        let secret = b"spammer-secret";
        let p1 = generate_rln_proof(secret, 10, b"msg1").unwrap();
        let p2 = generate_rln_proof(secret, 10, b"msg2").unwrap();

        // Same epoch, same user, different messages → spam detected
        let result = detect_spam(&p1, &p2);
        assert!(result.is_some());
    }

    #[test]
    fn test_no_spam_different_epochs() {
        let secret = b"honest-user";
        let p1 = generate_rln_proof(secret, 1, b"msg1").unwrap();
        let p2 = generate_rln_proof(secret, 2, b"msg2").unwrap();

        assert!(detect_spam(&p1, &p2).is_none());
    }

    #[test]
    fn test_no_spam_same_message() {
        let secret = b"user";
        let p1 = generate_rln_proof(secret, 5, b"same").unwrap();
        let p2 = generate_rln_proof(secret, 5, b"same").unwrap();

        // Same message in same epoch = duplicate, not spam
        assert!(detect_spam(&p1, &p2).is_none());
    }

    #[test]
    fn test_empty_secret_rejected() {
        assert!(generate_rln_proof(b"", 1, b"msg").is_err());
    }
}
