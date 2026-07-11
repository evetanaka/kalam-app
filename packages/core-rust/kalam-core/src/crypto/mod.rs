//! Cryptographic protocols for Kalam E2E messaging.
//!
//! - **keys**: Key generation and management (X25519, Ed25519)
//! - **x3dh**: Extended Triple Diffie-Hellman key agreement
//! - **ratchet**: Double Ratchet for forward-secret message encryption
//! - **sealed**: Sealed sender envelopes (blind sender identity)
//! - **rln**: Rate Limiting Nullifiers (anti-spam)

pub mod keys;
pub mod x3dh;
pub mod ratchet;
pub mod sealed;
pub mod rln;
pub mod mls;
pub mod ephemeral;
