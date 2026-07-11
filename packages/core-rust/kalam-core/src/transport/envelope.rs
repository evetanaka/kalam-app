//! Message envelopes for the Kalam transport layer.
//!
//! An envelope wraps a sealed message with its RLN proof, topic, and TTL
//! for relay through the Waku network.

use crate::crypto::rln::{verify_rln_proof, RLNProof};
use crate::crypto::sealed::SealedEnvelope;
use crate::types::Timestamp;
use crate::KalamError;
use serde::{Deserialize, Serialize};

/// Content type for envelope payloads.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContentType {
    /// Normal application message.
    Application,
    /// MLS commit message.
    Commit,
    /// MLS welcome message for new members.
    Welcome,
    /// MLS proposal message.
    Proposal,
    /// Ephemeral config change notification.
    EphemeralConfig,
}

/// A transport envelope ready to be sent over the network.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Envelope {
    /// Blinded topic identifier (prevents topic correlation by relays).
    pub topic: Vec<u8>,
    /// The sealed message payload (sender identity hidden).
    pub sealed_payload: SealedEnvelope,
    /// RLN proof for rate limiting.
    pub rln_proof: RLNProof,
    /// Time-to-live in seconds.
    pub ttl: u64,
    /// Creation timestamp.
    pub timestamp: Timestamp,
}

/// Create a new transport envelope.
///
/// Wraps a sealed message with RLN proof and metadata.
pub fn create_envelope(
    topic: &[u8],
    sealed: &SealedEnvelope,
    proof: &RLNProof,
    ttl_secs: u64,
) -> Envelope {
    Envelope {
        topic: topic.to_vec(),
        sealed_payload: sealed.clone(),
        rln_proof: proof.clone(),
        ttl: ttl_secs,
        timestamp: Timestamp::now(),
    }
}

/// Validate an envelope's structure, TTL, and RLN proof.
///
/// Returns `Ok(true)` if valid, `Ok(false)` if the RLN proof is invalid,
/// or `Err` on structural issues.
pub fn validate_envelope(envelope: &Envelope, merkle_root: &[u8]) -> Result<bool, KalamError> {
    // Check TTL
    if envelope.ttl == 0 {
        return Err(KalamError::Transport("Envelope TTL is zero".into()));
    }

    // Check not expired
    let now = Timestamp::now();
    if envelope.timestamp.0 + envelope.ttl < now.0 {
        return Err(KalamError::Transport("Envelope expired".into()));
    }

    // Check topic not empty
    if envelope.topic.is_empty() {
        return Err(KalamError::Transport("Empty topic".into()));
    }

    // Verify RLN proof
    verify_rln_proof(&envelope.rln_proof, merkle_root)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::keys::generate_identity_key;
    use crate::crypto::rln::generate_rln_proof;
    use crate::crypto::sealed::seal_message;
    use sha2::{Digest, Sha256};

    #[test]
    fn test_create_and_validate_envelope() {
        let recipient = generate_identity_key().unwrap();
        let secret = b"identity-secret";

        let sealed = seal_message(b"alice", &recipient.public_key, b"hello").unwrap();
        let proof = generate_rln_proof(secret, 1, b"hello").unwrap();
        let merkle_root = Sha256::digest(secret).to_vec();

        let env = create_envelope(b"topic-1", &sealed, &proof, 3600);
        assert!(validate_envelope(&env, &merkle_root).unwrap());
    }

    #[test]
    fn test_zero_ttl_rejected() {
        let recipient = generate_identity_key().unwrap();
        let sealed = seal_message(b"a", &recipient.public_key, b"m").unwrap();
        let proof = generate_rln_proof(b"s", 1, b"m").unwrap();

        let env = create_envelope(b"t", &sealed, &proof, 0);
        assert!(validate_envelope(&env, b"root").is_err());
    }
}
