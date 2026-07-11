//! Kalam FFI — uniffi bindings for React Native (iOS/Android)
//!
//! This crate exposes kalam-core functions to Swift and Kotlin
//! via Mozilla's uniffi code generator.

use kalam_core;

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

// TODO P1: Add identity functions (create_account, restore_account, etc.)
// TODO P2: Add messaging functions (send_message, decrypt_message, etc.)
// TODO P5: Add economy functions (get_deposit, create_voucher, etc.)

uniffi::setup_scaffolding!();
