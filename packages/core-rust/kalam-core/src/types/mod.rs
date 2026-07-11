//! Shared types used across Kalam core modules.

use serde::{Deserialize, Serialize};
use zeroize::{Zeroize, ZeroizeOnDrop};

/// Ethereum-style address (0x-prefixed, 40 hex chars).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Address(String);

impl Address {
    /// Create a new `Address`, validating the format.
    pub fn new(s: &str) -> Result<Self, crate::KalamError> {
        if !s.starts_with("0x") || s.len() != 42 {
            return Err(crate::KalamError::Identity(
                "Address must be 0x-prefixed and 40 hex chars".into(),
            ));
        }
        if !s[2..].chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(crate::KalamError::Identity(
                "Address contains non-hex characters".into(),
            ));
        }
        Ok(Self(s.to_lowercase()))
    }

    /// Return the inner string.
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for Address {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// A signing key that is zeroized on drop.
#[derive(Debug, Clone, Zeroize, ZeroizeOnDrop)]
pub struct SigningKey {
    /// Raw key bytes.
    bytes: Vec<u8>,
}

impl SigningKey {
    /// Create a new signing key from raw bytes.
    pub fn new(bytes: Vec<u8>) -> Self {
        Self { bytes }
    }

    /// Access the raw key bytes.
    pub fn as_bytes(&self) -> &[u8] {
        &self.bytes
    }
}

/// Unix timestamp in seconds.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct Timestamp(pub u64);

impl Timestamp {
    /// Current time as a `Timestamp`.
    pub fn now() -> Self {
        Self(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_address_valid() {
        let addr = Address::new("0x1234567890abcdef1234567890abcdef12345678");
        assert!(addr.is_ok());
    }

    #[test]
    fn test_address_no_prefix() {
        assert!(Address::new("1234567890abcdef1234567890abcdef12345678").is_err());
    }

    #[test]
    fn test_address_wrong_length() {
        assert!(Address::new("0x1234").is_err());
    }

    #[test]
    fn test_address_non_hex() {
        assert!(Address::new("0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG").is_err());
    }

    #[test]
    fn test_signing_key_zeroize() {
        let key = SigningKey::new(vec![1, 2, 3, 4]);
        assert_eq!(key.as_bytes(), &[1, 2, 3, 4]);
        // zeroize happens on drop
    }

    #[test]
    fn test_timestamp_now() {
        let ts = Timestamp::now();
        assert!(ts.0 > 0);
    }
}
