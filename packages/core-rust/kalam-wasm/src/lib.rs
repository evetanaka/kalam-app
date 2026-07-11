//! Kalam WASM — WebAssembly bindings for the web app
//!
//! Exposes kalam-core functions to JavaScript via wasm-bindgen.

use wasm_bindgen::prelude::*;
use kalam_core;
use kalam_core::identity::{account, name, passkey};

/// Initialize the Kalam engine (call once from web app startup)
#[wasm_bindgen]
pub fn kalam_init() -> Result<(), JsValue> {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    kalam_core::init().map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Healthcheck — returns version string
#[wasm_bindgen]
pub fn kalam_healthcheck() -> String {
    kalam_core::healthcheck()
}

/// Get the core version
#[wasm_bindgen]
pub fn kalam_version() -> String {
    kalam_core::VERSION.to_string()
}

// ── P1: Identity ──────────────────────────────────────────

/// Create WebAuthn passkey creation parameters (JSON string).
#[wasm_bindgen]
pub fn create_passkey_params() -> Result<String, JsValue> {
    let params = passkey::create_passkey()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_json::to_string(&params)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Finalize passkey registration. Returns JSON `{ success, address, error }`.
#[wasm_bindgen]
pub fn finalize_passkey(credential_id: &str, public_key: &[u8]) -> Result<String, JsValue> {
    let cred = passkey::PasskeyCredential {
        credential_id: credential_id.as_bytes().to_vec(),
        public_key: public_key.to_vec(),
        attestation: vec![],
    };

    let factory = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    match account::compute_counterfactual_address(&cred.public_key, factory, b"kalam-v1") {
        Ok(address) => Ok(serde_json::json!({
            "success": true,
            "address": address,
        }).to_string()),
        Err(e) => Ok(serde_json::json!({
            "success": false,
            "address": "",
            "error": e.to_string(),
        }).to_string()),
    }
}

/// Compute the counterfactual smart account address for a public key.
#[wasm_bindgen]
pub fn compute_account_address(public_key: &[u8]) -> Result<String, JsValue> {
    let factory = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    account::compute_counterfactual_address(public_key, factory, b"kalam-v1")
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Validate a .kalam name. Returns JSON `{ valid, error }`.
#[wasm_bindgen]
pub fn validate_kalam_name(name_str: &str) -> String {
    match name::validate_name(name_str) {
        Ok(()) => serde_json::json!({ "valid": true }).to_string(),
        Err(e) => serde_json::json!({ "valid": false, "error": e.to_string() }).to_string(),
    }
}

/// Open an encrypted database. Returns true on success.
#[wasm_bindgen]
pub fn open_database(path: &str, key: &[u8]) -> Result<bool, JsValue> {
    let db = kalam_core::storage::Database::open(path, key)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    db.init_schema()
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(true)
}
