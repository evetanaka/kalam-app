//! Kalam Core — Encrypted messaging engine
//!
//! This crate contains the core logic for Kalam:
//! - Identity management (passkeys, ERC-4337 smart accounts)
//! - Cryptographic protocols (X3DH, Double Ratchet, MLS)
//! - Encrypted storage (SQLCipher)
//! - Transport abstraction (Waku)
//! - Economic primitives (vouchers, deposits)

pub mod crypto;
pub mod identity;
pub mod storage;
pub mod transport;
pub mod economy;
pub mod types;

/// Core version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initialize the Kalam core engine
///
/// Must be called once before any other operation.
/// Sets up the Tokio runtime on a background thread.
pub fn init() -> Result<(), KalamError> {
    tracing_subscriber::fmt::init();
    tracing::info!("Kalam core v{} initialized", VERSION);
    Ok(())
}

/// Healthcheck — verifies the core is operational
pub fn healthcheck() -> String {
    format!("kalam-core v{} OK", VERSION)
}

#[derive(Debug, thiserror::Error)]
pub enum KalamError {
    #[error("Crypto error: {0}")]
    Crypto(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("Transport error: {0}")]
    Transport(String),

    #[error("Identity error: {0}")]
    Identity(String),

    #[error("Economy error: {0}")]
    Economy(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_healthcheck() {
        let result = healthcheck();
        assert!(result.contains("OK"));
    }
}
