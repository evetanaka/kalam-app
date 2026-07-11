//! Key management for Kalam cryptographic protocols.
//!
//! Provides X25519 key pairs for Diffie-Hellman exchanges,
//! Ed25519 signing for pre-key signatures, and pre-key bundle construction.

use crate::KalamError;
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use x25519_dalek::{PublicKey as X25519Public, StaticSecret};
use zeroize::{Zeroize, ZeroizeOnDrop};

/// An X25519 key pair for Diffie-Hellman key exchange.
///
/// The secret key is zeroized on drop to prevent key material leakage.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct KeyPair {
    /// Raw X25519 public key bytes (32 bytes).
    #[zeroize(skip)]
    pub public_key: Vec<u8>,
    /// Raw X25519 secret key bytes (32 bytes). Zeroized on drop.
    pub secret_key: Vec<u8>,
}

impl std::fmt::Debug for KeyPair {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("KeyPair")
            .field("public_key", &hex::encode(&self.public_key))
            .field("secret_key", &"[REDACTED]")
            .finish()
    }
}

impl KeyPair {
    /// Perform an X25519 Diffie-Hellman exchange with another public key.
    ///
    /// Returns the 32-byte shared secret.
    pub fn dh(&self, their_public: &[u8]) -> Result<Vec<u8>, KalamError> {
        if their_public.len() != 32 {
            return Err(KalamError::Crypto("Invalid public key length".into()));
        }
        let secret = StaticSecret::from(
            <[u8; 32]>::try_from(&self.secret_key[..])
                .map_err(|_| KalamError::Crypto("Invalid secret key length".into()))?,
        );
        let their_pub = X25519Public::from(
            <[u8; 32]>::try_from(their_public)
                .map_err(|_| KalamError::Crypto("Invalid public key length".into()))?,
        );
        Ok(secret.diffie_hellman(&their_pub).as_bytes().to_vec())
    }
}

/// A pre-key bundle published to the server for X3DH initiation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreKeyBundle {
    /// Long-term identity public key (X25519).
    pub identity_key: Vec<u8>,
    /// Signed pre-key public key (X25519).
    pub signed_pre_key: Vec<u8>,
    /// Ed25519 signature over the signed pre-key.
    pub signature: Vec<u8>,
    /// One-time pre-key public keys (X25519).
    pub one_time_pre_keys: Vec<Vec<u8>>,
}

/// Generate a new X25519 identity key pair.
///
/// The secret key is cryptographically random and zeroized on drop.
pub fn generate_identity_key() -> Result<KeyPair, KalamError> {
    let secret = StaticSecret::random_from_rng(OsRng);
    let public = X25519Public::from(&secret);
    Ok(KeyPair {
        public_key: public.as_bytes().to_vec(),
        secret_key: secret.to_bytes().to_vec(),
    })
}

/// Generate a signed pre-key and its Ed25519 signature.
///
/// The signature is produced by signing the pre-key's public bytes with an
/// Ed25519 key derived from the identity key pair's secret material.
///
/// Returns `(pre_key_pair, signature)`.
pub fn generate_signed_pre_key(
    identity_key: &KeyPair,
) -> Result<(KeyPair, Vec<u8>), KalamError> {
    use ed25519_dalek::{Signer, SigningKey};

    let pre_key = generate_identity_key()?;

    // Derive an Ed25519 signing key from the identity secret via HKDF
    let hk = hkdf::Hkdf::<sha2::Sha256>::new(None, &identity_key.secret_key);
    let mut ed_seed = [0u8; 32];
    hk.expand(b"kalam-ed25519-signing", &mut ed_seed)
        .map_err(|e| KalamError::Crypto(format!("HKDF failed: {e}")))?;

    let signing_key = SigningKey::from_bytes(&ed_seed);
    ed_seed.zeroize();
    let signature = signing_key.sign(&pre_key.public_key);

    Ok((pre_key, signature.to_bytes().to_vec()))
}

/// Generate `count` one-time pre-key pairs.
pub fn generate_one_time_pre_keys(count: usize) -> Result<Vec<KeyPair>, KalamError> {
    (0..count).map(|_| generate_identity_key()).collect()
}

/// Assemble a [`PreKeyBundle`] from component keys.
pub fn create_pre_key_bundle(
    identity: &KeyPair,
    signed: &KeyPair,
    sig: &[u8],
    otpks: &[KeyPair],
) -> PreKeyBundle {
    PreKeyBundle {
        identity_key: identity.public_key.clone(),
        signed_pre_key: signed.public_key.clone(),
        signature: sig.to_vec(),
        one_time_pre_keys: otpks.iter().map(|k| k.public_key.clone()).collect(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_identity_key() {
        let kp = generate_identity_key().unwrap();
        assert_eq!(kp.public_key.len(), 32);
        assert_eq!(kp.secret_key.len(), 32);
    }

    #[test]
    fn test_dh_exchange() {
        let a = generate_identity_key().unwrap();
        let b = generate_identity_key().unwrap();
        let shared_a = a.dh(&b.public_key).unwrap();
        let shared_b = b.dh(&a.public_key).unwrap();
        assert_eq!(shared_a, shared_b);
    }

    #[test]
    fn test_signed_pre_key() {
        let id = generate_identity_key().unwrap();
        let (spk, sig) = generate_signed_pre_key(&id).unwrap();
        assert_eq!(spk.public_key.len(), 32);
        assert_eq!(sig.len(), 64);
    }

    #[test]
    fn test_one_time_pre_keys() {
        let keys = generate_one_time_pre_keys(5).unwrap();
        assert_eq!(keys.len(), 5);
    }

    #[test]
    fn test_pre_key_bundle() {
        let id = generate_identity_key().unwrap();
        let (spk, sig) = generate_signed_pre_key(&id).unwrap();
        let otpks = generate_one_time_pre_keys(3).unwrap();
        let bundle = create_pre_key_bundle(&id, &spk, &sig, &otpks);
        assert_eq!(bundle.one_time_pre_keys.len(), 3);
        assert_eq!(bundle.identity_key, id.public_key);
    }
}
