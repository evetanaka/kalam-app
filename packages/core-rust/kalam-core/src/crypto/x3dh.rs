//! X3DH (Extended Triple Diffie-Hellman) key agreement protocol.
//!
//! Establishes a shared secret between two parties using their identity keys,
//! a signed pre-key, an ephemeral key, and optionally a one-time pre-key.
//! See: <https://signal.org/docs/specifications/x3dh/>

use super::keys::{generate_identity_key, KeyPair, PreKeyBundle};
use crate::KalamError;
use hkdf::Hkdf;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use zeroize::{Zeroize, ZeroizeOnDrop};

/// The result of an X3DH key agreement — a shared secret and associated data.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct X3DHSession {
    /// 32-byte shared secret derived via HKDF from the DH outputs.
    pub shared_secret: Vec<u8>,
    /// Associated data (concatenation of both identity public keys).
    #[zeroize(skip)]
    pub associated_data: Vec<u8>,
}

impl std::fmt::Debug for X3DHSession {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("X3DHSession")
            .field("shared_secret", &"[REDACTED]")
            .finish()
    }
}

/// Header sent from initiator to responder containing ephemeral key info.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct X3DHHeader {
    /// Initiator's identity public key.
    pub identity_key: Vec<u8>,
    /// Initiator's ephemeral public key (generated for this session).
    pub ephemeral_key: Vec<u8>,
    /// Index of the one-time pre-key used (if any).
    pub one_time_pre_key_id: Option<usize>,
}

/// KDF info string for X3DH.
const X3DH_KDF_INFO: &[u8] = b"kalam-x3dh-shared-secret";

/// Derive the shared secret from concatenated DH outputs.
fn kdf(dh_concat: &[u8]) -> Result<Vec<u8>, KalamError> {
    // Prepend 32 0xFF bytes as per Signal spec
    let mut input = vec![0xFFu8; 32];
    input.extend_from_slice(dh_concat);

    let hk = Hkdf::<Sha256>::new(None, &input);
    let mut okm = vec![0u8; 32];
    hk.expand(X3DH_KDF_INFO, &mut okm)
        .map_err(|e| KalamError::Crypto(format!("X3DH KDF failed: {e}")))?;
    Ok(okm)
}

/// Initiate an X3DH key agreement with a remote party's pre-key bundle.
///
/// Performs four DH computations:
/// - DH1: our identity key × their signed pre-key
/// - DH2: our ephemeral key × their identity key
/// - DH3: our ephemeral key × their signed pre-key
/// - DH4: our ephemeral key × their one-time pre-key (if available)
///
/// Returns the session and a header to send to the responder.
pub fn initiate_x3dh(
    our_identity: &KeyPair,
    their_bundle: &PreKeyBundle,
) -> Result<(X3DHSession, X3DHHeader), KalamError> {
    let ephemeral = generate_identity_key()?;

    // DH1: IKa × SPKb
    let dh1 = our_identity.dh(&their_bundle.signed_pre_key)?;
    // DH2: EKa × IKb
    let dh2 = ephemeral.dh(&their_bundle.identity_key)?;
    // DH3: EKa × SPKb
    let dh3 = ephemeral.dh(&their_bundle.signed_pre_key)?;

    let mut dh_concat = Vec::with_capacity(128);
    dh_concat.extend_from_slice(&dh1);
    dh_concat.extend_from_slice(&dh2);
    dh_concat.extend_from_slice(&dh3);

    let otpk_id = if !their_bundle.one_time_pre_keys.is_empty() {
        // DH4: EKa × OPKb (use first available)
        let dh4 = ephemeral.dh(&their_bundle.one_time_pre_keys[0])?;
        dh_concat.extend_from_slice(&dh4);
        Some(0)
    } else {
        None
    };

    let shared_secret = kdf(&dh_concat)?;

    // AD = IKa || IKb
    let mut ad = Vec::with_capacity(64);
    ad.extend_from_slice(&our_identity.public_key);
    ad.extend_from_slice(&their_bundle.identity_key);

    let session = X3DHSession {
        shared_secret,
        associated_data: ad,
    };

    let header = X3DHHeader {
        identity_key: our_identity.public_key.clone(),
        ephemeral_key: ephemeral.public_key.clone(),
        one_time_pre_key_id: otpk_id,
    };

    Ok((session, header))
}

/// Respond to an X3DH initiation using our own key material.
///
/// Mirrors the DH computations from the initiator's side.
pub fn respond_x3dh(
    our_identity: &KeyPair,
    our_signed_pre_key: &KeyPair,
    our_one_time: Option<&KeyPair>,
    header: &X3DHHeader,
) -> Result<X3DHSession, KalamError> {
    // DH1: SPKb × IKa
    let dh1 = our_signed_pre_key.dh(&header.identity_key)?;
    // DH2: IKb × EKa
    let dh2 = our_identity.dh(&header.ephemeral_key)?;
    // DH3: SPKb × EKa
    let dh3 = our_signed_pre_key.dh(&header.ephemeral_key)?;

    let mut dh_concat = Vec::with_capacity(128);
    dh_concat.extend_from_slice(&dh1);
    dh_concat.extend_from_slice(&dh2);
    dh_concat.extend_from_slice(&dh3);

    if let Some(otpk) = our_one_time {
        // DH4: OPKb × EKa
        let dh4 = otpk.dh(&header.ephemeral_key)?;
        dh_concat.extend_from_slice(&dh4);
    }

    let shared_secret = kdf(&dh_concat)?;

    // AD = IKa || IKb
    let mut ad = Vec::with_capacity(64);
    ad.extend_from_slice(&header.identity_key);
    ad.extend_from_slice(&our_identity.public_key);

    Ok(X3DHSession {
        shared_secret,
        associated_data: ad,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::keys::*;

    #[test]
    fn test_x3dh_handshake_with_otpk() {
        // Bob generates keys and publishes bundle
        let bob_identity = generate_identity_key().unwrap();
        let (bob_spk, bob_sig) = generate_signed_pre_key(&bob_identity).unwrap();
        let bob_otpks = generate_one_time_pre_keys(3).unwrap();
        let bob_bundle = create_pre_key_bundle(&bob_identity, &bob_spk, &bob_sig, &bob_otpks);

        // Alice initiates
        let alice_identity = generate_identity_key().unwrap();
        let (alice_session, header) = initiate_x3dh(&alice_identity, &bob_bundle).unwrap();

        // Bob responds
        let bob_otpk = if header.one_time_pre_key_id.is_some() {
            Some(&bob_otpks[0])
        } else {
            None
        };
        let bob_session =
            respond_x3dh(&bob_identity, &bob_spk, bob_otpk, &header).unwrap();

        assert_eq!(alice_session.shared_secret, bob_session.shared_secret);
        assert_eq!(alice_session.associated_data, bob_session.associated_data);
    }

    #[test]
    fn test_x3dh_handshake_without_otpk() {
        let bob_identity = generate_identity_key().unwrap();
        let (bob_spk, bob_sig) = generate_signed_pre_key(&bob_identity).unwrap();
        let bob_bundle = create_pre_key_bundle(&bob_identity, &bob_spk, &bob_sig, &[]);

        let alice_identity = generate_identity_key().unwrap();
        let (alice_session, header) = initiate_x3dh(&alice_identity, &bob_bundle).unwrap();

        let bob_session = respond_x3dh(&bob_identity, &bob_spk, None, &header).unwrap();

        assert_eq!(alice_session.shared_secret, bob_session.shared_secret);
    }
}
