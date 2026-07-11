//! Kalam FFI — uniffi bindings for React Native (iOS/Android)
//!
//! This crate exposes kalam-core functions to Swift and Kotlin
//! via Mozilla's uniffi code generator.

use kalam_core;
use kalam_core::identity::{account, name, passkey};

/// Initialize the Kalam engine (call once from app startup)
#[uniffi::export]
pub fn kalam_init() -> Result<(), String> {
    kalam_core::init().map_err(|e| e.to_string())
}

/// Healthcheck — returns version string
#[uniffi::export]
pub fn kalam_healthcheck() -> String {
    kalam_core::healthcheck()
}

/// Get the core version
#[uniffi::export]
pub fn kalam_version() -> String {
    kalam_core::VERSION.to_string()
}

// ── P1: Identity ──────────────────────────────────────────

/// Result of passkey creation params generation.
#[derive(uniffi::Record)]
pub struct PasskeyCreationParams {
    pub rp_id: String,
    pub rp_name: String,
    pub challenge: Vec<u8>,
    pub user_id: Vec<u8>,
    pub user_name: String,
    pub pub_key_cred_params: Vec<i32>,
    pub authenticator_attachment: String,
    pub resident_key: String,
    pub user_verification: String,
}

/// Result of passkey finalization.
#[derive(uniffi::Record)]
pub struct PasskeyResult {
    pub success: bool,
    pub address: String,
    pub error: Option<String>,
}

/// Name validation result.
#[derive(uniffi::Record)]
pub struct NameValidation {
    pub valid: bool,
    pub error: Option<String>,
}

/// Create WebAuthn passkey creation parameters for the JS layer.
#[uniffi::export]
pub fn create_passkey_params() -> Result<PasskeyCreationParams, String> {
    let params = passkey::create_passkey().map_err(|e| e.to_string())?;
    Ok(PasskeyCreationParams {
        rp_id: params.rp_id,
        rp_name: params.rp_name,
        challenge: params.challenge,
        user_id: params.user_id,
        user_name: params.user_name,
        pub_key_cred_params: params.pub_key_cred_params,
        authenticator_attachment: params.authenticator_attachment,
        resident_key: params.resident_key,
        user_verification: params.user_verification,
    })
}

/// Finalize passkey registration with the credential from the JS layer.
///
/// Returns the computed smart account address.
#[uniffi::export]
pub fn finalize_passkey(credential_id: String, public_key: Vec<u8>) -> Result<PasskeyResult, String> {
    let cred = passkey::PasskeyCredential {
        credential_id: credential_id.into_bytes(),
        public_key: public_key.clone(),
        attestation: vec![],
    };

    let factory = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // ERC-4337 EntryPoint v0.6
    match account::compute_counterfactual_address(&cred.public_key, factory, b"kalam-v1") {
        Ok(address) => Ok(PasskeyResult {
            success: true,
            address,
            error: None,
        }),
        Err(e) => Ok(PasskeyResult {
            success: false,
            address: String::new(),
            error: Some(e.to_string()),
        }),
    }
}

/// Compute the counterfactual smart account address for a public key.
#[uniffi::export]
pub fn compute_account_address(public_key: Vec<u8>) -> Result<String, String> {
    let factory = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    account::compute_counterfactual_address(&public_key, factory, b"kalam-v1")
        .map_err(|e| e.to_string())
}

/// Validate a .kalam name.
#[uniffi::export]
pub fn validate_kalam_name(name_str: String) -> NameValidation {
    match name::validate_name(&name_str) {
        Ok(()) => NameValidation {
            valid: true,
            error: None,
        },
        Err(e) => NameValidation {
            valid: false,
            error: Some(e.to_string()),
        },
    }
}

/// Open an encrypted database. Returns true on success.
#[uniffi::export]
pub fn open_database(path: String, key: Vec<u8>) -> Result<bool, String> {
    let db = kalam_core::storage::Database::open(&path, &key).map_err(|e| e.to_string())?;
    db.init_schema().map_err(|e| e.to_string())?;
    Ok(true)
}

// ── P2: Crypto & Transport ────────────────────────────────

/// Generate a full identity key bundle (identity key + signed pre-key + one-time pre-keys).
///
/// Returns a JSON string with the public components of the bundle.
#[uniffi::export]
pub fn generate_identity() -> Result<String, String> {
    use kalam_core::crypto::keys::*;

    let identity = generate_identity_key().map_err(|e| e.to_string())?;
    let (spk, sig) = generate_signed_pre_key(&identity).map_err(|e| e.to_string())?;
    let otpks = generate_one_time_pre_keys(10).map_err(|e| e.to_string())?;
    let bundle = create_pre_key_bundle(&identity, &spk, &sig, &otpks);

    serde_json::to_string(&serde_json::json!({
        "identity_public_key": hex::encode(&bundle.identity_key),
        "signed_pre_key": hex::encode(&bundle.signed_pre_key),
        "signature": hex::encode(&bundle.signature),
        "one_time_pre_keys": bundle.one_time_pre_keys.iter().map(hex::encode).collect::<Vec<_>>(),
    }))
    .map_err(|e| e.to_string())
}

/// Create an X3DH session with a remote party's pre-key bundle.
///
/// `their_bundle_json` is a JSON-encoded `PreKeyBundle`.
/// Returns a JSON string with the X3DH header and a session identifier.
#[uniffi::export]
pub fn create_session(their_bundle_json: String) -> Result<String, String> {
    use kalam_core::crypto::keys::*;
    use kalam_core::crypto::x3dh::*;

    let bundle: PreKeyBundle =
        serde_json::from_str(&their_bundle_json).map_err(|e| e.to_string())?;
    let our_identity = generate_identity_key().map_err(|e| e.to_string())?;
    let (session, header) = initiate_x3dh(&our_identity, &bundle).map_err(|e| e.to_string())?;

    let session_id = hex::encode(&session.associated_data);
    serde_json::to_string(&serde_json::json!({
        "session_id": session_id,
        "header": {
            "identity_key": hex::encode(&header.identity_key),
            "ephemeral_key": hex::encode(&header.ephemeral_key),
            "one_time_pre_key_id": header.one_time_pre_key_id,
        },
    }))
    .map_err(|e| e.to_string())
}

/// Encrypt a plaintext message for a session.
///
/// Returns a JSON-encoded `RatchetMessage`.
#[uniffi::export]
pub fn encrypt_message(session_id: String, plaintext: String) -> Result<String, String> {
    // NOTE: In production, session state would be loaded from storage by session_id.
    // This is a simplified version that creates a fresh ratchet for demonstration.
    let _ = session_id;
    Err("Session persistence not yet implemented — use core API directly".to_string())
}

/// Decrypt a ciphertext message for a session.
///
/// Returns the plaintext string.
#[uniffi::export]
pub fn decrypt_message(session_id: String, ciphertext_json: String) -> Result<String, String> {
    let _ = (session_id, ciphertext_json);
    Err("Session persistence not yet implemented — use core API directly".to_string())
}

/// Create a payment voucher for batch message settlement.
///
/// Returns a JSON-encoded `Voucher`.
#[uniffi::export]
pub fn create_message_voucher(message_count: u64) -> Result<String, String> {
    use kalam_core::transport::voucher;
    use kalam_core::types::SigningKey;

    let mut seed = vec![0u8; 32];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut seed);
    let key = SigningKey::new(seed);
    let epoch = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        / 3600;

    let v = voucher::create_voucher(&key, message_count, epoch).map_err(|e| e.to_string())?;
    serde_json::to_string(&v).map_err(|e| e.to_string())
}

uniffi::setup_scaffolding!();
