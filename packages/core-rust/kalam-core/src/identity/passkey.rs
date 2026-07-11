//! Passkey (WebAuthn) credential management.
//!
//! The actual WebAuthn ceremony happens in the JS layer via the platform API.
//! This module prepares parameters and verifies results on the Rust side.

use crate::types::SigningKey;
use crate::KalamError;
use serde::{Deserialize, Serialize};
use sha2::Sha256;

/// WebAuthn credential returned after passkey registration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasskeyCredential {
    /// Raw credential ID (base64url-encoded by the platform).
    pub credential_id: Vec<u8>,
    /// COSE-encoded public key from the attestation.
    pub public_key: Vec<u8>,
    /// Raw attestation object (CBOR).
    pub attestation: Vec<u8>,
}

/// Parameters sent to the JS layer to initiate a WebAuthn registration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasskeyCreationParams {
    /// Relying party ID.
    pub rp_id: String,
    /// Relying party display name.
    pub rp_name: String,
    /// Random challenge bytes.
    pub challenge: Vec<u8>,
    /// User ID (random).
    pub user_id: Vec<u8>,
    /// User display name placeholder.
    pub user_name: String,
    /// Requested algorithm identifiers (ES256 = -7).
    pub pub_key_cred_params: Vec<i32>,
    /// Authenticator attachment preference.
    pub authenticator_attachment: String,
    /// Resident key requirement.
    pub resident_key: String,
    /// User verification requirement.
    pub user_verification: String,
}

/// Prepare WebAuthn creation parameters.
///
/// The JS layer will use these to call `navigator.credentials.create()`.
pub fn create_passkey() -> Result<PasskeyCreationParams, KalamError> {
    use rand::RngCore;
    let mut challenge = vec![0u8; 32];
    let mut user_id = vec![0u8; 16];
    rand::thread_rng().fill_bytes(&mut challenge);
    rand::thread_rng().fill_bytes(&mut user_id);

    Ok(PasskeyCreationParams {
        rp_id: "kalam.app".into(),
        rp_name: "Kalam".into(),
        challenge,
        user_id,
        user_name: "kalam-user".into(),
        pub_key_cred_params: vec![-7], // ES256
        authenticator_attachment: "platform".into(),
        resident_key: "required".into(),
        user_verification: "required".into(),
    })
}

/// Verify a passkey signature over a challenge.
///
/// In production this performs ECDSA P-256 verification.
/// Currently validates structure; full COSE key parsing is TODO
/// when a WebAuthn crate is integrated.
pub fn verify_passkey_signature(
    credential: &PasskeyCredential,
    challenge: &[u8],
    signature: &[u8],
) -> Result<bool, KalamError> {
    if credential.public_key.is_empty() {
        return Err(KalamError::Crypto("Empty public key".into()));
    }
    if challenge.is_empty() {
        return Err(KalamError::Crypto("Empty challenge".into()));
    }
    if signature.is_empty() {
        return Err(KalamError::Crypto("Empty signature".into()));
    }

    // Structural validation passes; real P-256 verification will be
    // handled when we integrate a full WebAuthn library.
    // For now, return true if all inputs are non-empty (mock).
    Ok(true)
}

/// Derive an ERC-4337-compatible signing key from a passkey credential.
///
/// Uses HKDF-SHA256 over the credential's public key material.
pub fn derive_signing_key(credential: &PasskeyCredential) -> Result<SigningKey, KalamError> {
    if credential.public_key.is_empty() {
        return Err(KalamError::Crypto("Cannot derive key from empty public key".into()));
    }

    let hk = hkdf::Hkdf::<Sha256>::new(None, &credential.public_key);
    let mut okm = vec![0u8; 32];
    hk.expand(b"kalam-erc4337-signing-key", &mut okm)
        .map_err(|e| KalamError::Crypto(format!("HKDF expansion failed: {e}")))?;

    Ok(SigningKey::new(okm))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_passkey_params() {
        let params = create_passkey().unwrap();
        assert_eq!(params.rp_id, "kalam.app");
        assert_eq!(params.challenge.len(), 32);
        assert_eq!(params.user_id.len(), 16);
        assert_eq!(params.pub_key_cred_params, vec![-7]);
    }

    #[test]
    fn test_verify_rejects_empty() {
        let cred = PasskeyCredential {
            credential_id: vec![1],
            public_key: vec![],
            attestation: vec![],
        };
        assert!(verify_passkey_signature(&cred, b"challenge", b"sig").is_err());
    }

    #[test]
    fn test_derive_signing_key() {
        let cred = PasskeyCredential {
            credential_id: vec![1, 2, 3],
            public_key: vec![4, 5, 6, 7, 8, 9, 10, 11],
            attestation: vec![],
        };
        let key = derive_signing_key(&cred).unwrap();
        assert_eq!(key.as_bytes().len(), 32);
    }

    #[test]
    fn test_derive_signing_key_empty() {
        let cred = PasskeyCredential {
            credential_id: vec![],
            public_key: vec![],
            attestation: vec![],
        };
        assert!(derive_signing_key(&cred).is_err());
    }
}
