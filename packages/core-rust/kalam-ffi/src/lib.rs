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

uniffi::setup_scaffolding!();
