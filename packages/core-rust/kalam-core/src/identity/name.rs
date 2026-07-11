//! .kalam name registration, validation, and resolution.
//!
//! Name resolution uses CCIP-Read (EIP-3668) in production.
//! This module validates names locally and provides mock resolution
//! for core-only usage; real CCIP-Read calls happen in the JS layer.

use crate::KalamError;
use serde::{Deserialize, Serialize};

/// A registered .kalam name.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KalamName {
    /// The label part (e.g. "alice").
    pub label: String,
    /// Full name with suffix (e.g. "alice.kalam").
    pub full_name: String,
    /// Resolved Ethereum address.
    pub address: String,
    /// Whether the name has been verified on-chain.
    pub is_verified: bool,
}

/// Validate a .kalam name label.
///
/// Rules:
/// - 3–20 characters
/// - Lowercase alphanumeric and hyphens only
/// - No leading or trailing hyphen
pub fn validate_name(name: &str) -> Result<(), KalamError> {
    let len = name.len();
    if len < 3 || len > 20 {
        return Err(KalamError::Identity(format!(
            "Name must be 3-20 characters, got {len}"
        )));
    }
    if !name
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    {
        return Err(KalamError::Identity(
            "Name must contain only lowercase alphanumeric characters and hyphens".into(),
        ));
    }
    if name.starts_with('-') || name.ends_with('-') {
        return Err(KalamError::Identity(
            "Name must not start or end with a hyphen".into(),
        ));
    }
    Ok(())
}

/// Check if a .kalam name is available.
///
/// In core this returns mock data (always available).
/// Real availability checks go through CCIP-Read in the JS layer.
pub fn check_name_availability(name: &str) -> Result<bool, KalamError> {
    validate_name(name)?;
    // Mock: name is always available in core
    Ok(true)
}

/// Resolve a .kalam name to an Ethereum address.
///
/// In core this returns a mock zero-address.
/// Real resolution happens via CCIP-Read in the JS layer.
pub fn resolve_name(name: &str) -> Result<String, KalamError> {
    validate_name(name)?;
    // Mock: return zero address
    Ok("0x0000000000000000000000000000000000000000".into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_names() {
        assert!(validate_name("alice").is_ok());
        assert!(validate_name("bob-42").is_ok());
        assert!(validate_name("abc").is_ok());
        assert!(validate_name("a-b-c-d-e-f-g-h-i-j").is_ok()); // 19 chars
    }

    #[test]
    fn test_too_short() {
        assert!(validate_name("ab").is_err());
    }

    #[test]
    fn test_too_long() {
        assert!(validate_name("abcdefghijklmnopqrstu").is_err()); // 21 chars
    }

    #[test]
    fn test_uppercase() {
        assert!(validate_name("Alice").is_err());
    }

    #[test]
    fn test_leading_hyphen() {
        assert!(validate_name("-alice").is_err());
    }

    #[test]
    fn test_trailing_hyphen() {
        assert!(validate_name("alice-").is_err());
    }

    #[test]
    fn test_special_chars() {
        assert!(validate_name("ali.ce").is_err());
        assert!(validate_name("ali ce").is_err());
        assert!(validate_name("ali_ce").is_err());
    }

    #[test]
    fn test_check_availability() {
        assert!(check_name_availability("alice").unwrap());
    }

    #[test]
    fn test_resolve_name() {
        let addr = resolve_name("alice").unwrap();
        assert!(addr.starts_with("0x"));
    }
}
