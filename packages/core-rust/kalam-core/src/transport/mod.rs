//! Transport abstraction layer for Kalam messaging.
//!
//! Provides message envelopes and payment vouchers. The actual network
//! transport (Waku) is handled in the JavaScript layer.

pub mod envelope;
pub mod voucher;
