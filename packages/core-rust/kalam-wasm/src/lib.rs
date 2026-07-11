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

// ── P2: Crypto & Transport ──────────────────────────────────

/// Generate a full identity key bundle. Returns JSON string.
#[wasm_bindgen]
pub fn generate_identity() -> Result<String, JsValue> {
    use kalam_core::crypto::keys::*;

    let identity = generate_identity_key().map_err(|e| JsValue::from_str(&e.to_string()))?;
    let (spk, sig) = generate_signed_pre_key(&identity).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let otpks = generate_one_time_pre_keys(10).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let bundle = create_pre_key_bundle(&identity, &spk, &sig, &otpks);

    serde_json::to_string(&serde_json::json!({
        "identity_public_key": hex::encode(&bundle.identity_key),
        "signed_pre_key": hex::encode(&bundle.signed_pre_key),
        "signature": hex::encode(&bundle.signature),
        "one_time_pre_keys": bundle.one_time_pre_keys.iter().map(hex::encode).collect::<Vec<_>>(),
    }))
    .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Create an X3DH session with a remote party's pre-key bundle (JSON).
/// Returns JSON with session_id and X3DH header.
#[wasm_bindgen]
pub fn create_session(their_bundle_json: &str) -> Result<String, JsValue> {
    use kalam_core::crypto::keys::*;
    use kalam_core::crypto::x3dh::*;

    let bundle: PreKeyBundle = serde_json::from_str(their_bundle_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let our_identity = generate_identity_key().map_err(|e| JsValue::from_str(&e.to_string()))?;
    let (session, header) = initiate_x3dh(&our_identity, &bundle)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let session_id = hex::encode(&session.associated_data);
    serde_json::to_string(&serde_json::json!({
        "session_id": session_id,
        "header": {
            "identity_key": hex::encode(&header.identity_key),
            "ephemeral_key": hex::encode(&header.ephemeral_key),
            "one_time_pre_key_id": header.one_time_pre_key_id,
        },
    }))
    .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Encrypt a message for a session. Returns JSON ciphertext.
#[wasm_bindgen]
pub fn encrypt_message(session_id: &str, plaintext: &str) -> Result<String, JsValue> {
    let _ = (session_id, plaintext);
    Err(JsValue::from_str("Session persistence not yet implemented — use core API directly"))
}

/// Decrypt a message for a session. Returns plaintext string.
#[wasm_bindgen]
pub fn decrypt_message(session_id: &str, ciphertext_json: &str) -> Result<String, JsValue> {
    let _ = (session_id, ciphertext_json);
    Err(JsValue::from_str("Session persistence not yet implemented — use core API directly"))
}

/// Create a payment voucher. Returns JSON voucher.
#[wasm_bindgen]
pub fn create_message_voucher(message_count: u64) -> Result<String, JsValue> {
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

    let v = voucher::create_voucher(&key, message_count, epoch)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_json::to_string(&v).map_err(|e| JsValue::from_str(&e.to_string()))
}
