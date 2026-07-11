//! Kalam WASM — WebAssembly bindings for the web app
//!
//! Exposes kalam-core functions to JavaScript via wasm-bindgen.

use wasm_bindgen::prelude::*;
use kalam_core;

/// Initialize the Kalam engine (call once from web app startup)
#[wasm_bindgen]
pub fn kalam_init() -> Result<(), JsValue> {
    // Set up panic hook for better error messages in the browser
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

// TODO P1: Add identity functions
// TODO P2: Add messaging functions
// TODO P5: Add economy functions
