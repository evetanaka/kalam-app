//! ERC-4337 Smart Account — counterfactual address computation and UserOperation building.

use crate::types::SigningKey;
use crate::KalamError;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// An ERC-4337 smart account.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartAccount {
    /// The counterfactual (or deployed) address.
    pub address: String,
    /// The factory contract address used to deploy this account.
    pub factory_address: String,
    /// Whether the account has been deployed on-chain.
    pub is_deployed: bool,
    /// Salt used for CREATE2 address derivation.
    pub salt: Vec<u8>,
}

/// An ERC-4337 UserOperation (v0.6 format).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserOperation {
    /// Smart account address (sender).
    pub sender: String,
    /// Account nonce.
    pub nonce: u64,
    /// Init code for first-time deployment (factory address + calldata).
    pub init_code: Vec<u8>,
    /// Encoded call to execute.
    pub call_data: Vec<u8>,
    /// Maximum gas for verification.
    pub verification_gas_limit: u64,
    /// Maximum gas for execution.
    pub call_gas_limit: u64,
    /// Gas to compensate the bundler for pre-verification overhead.
    pub pre_verification_gas: u64,
    /// Maximum fee per gas unit.
    pub max_fee_per_gas: u64,
    /// Maximum priority fee per gas unit.
    pub max_priority_fee_per_gas: u64,
    /// Paymaster data (empty = self-sponsored).
    pub paymaster_and_data: Vec<u8>,
    /// ECDSA signature over the UserOp hash.
    pub signature: Vec<u8>,
}

/// Compute the counterfactual CREATE2 address without deploying.
///
/// Uses `keccak256(0xff ++ factory ++ salt ++ keccak256(init_code))` per EIP-1014.
/// Here we approximate with SHA-256 since full keccak is in ethers;
/// the real address computation uses the factory's `getAddress` view.
pub fn compute_counterfactual_address(
    public_key: &[u8],
    factory: &str,
    salt: &[u8],
) -> Result<String, KalamError> {
    if public_key.is_empty() {
        return Err(KalamError::Identity("Public key is empty".into()));
    }
    if factory.is_empty() {
        return Err(KalamError::Identity("Factory address is empty".into()));
    }

    // Deterministic address: hash(factory, salt, pubkey)
    let mut hasher = Sha256::new();
    hasher.update(b"\xff");
    hasher.update(factory.as_bytes());
    hasher.update(salt);
    hasher.update(public_key);
    let hash = hasher.finalize();

    // Take last 20 bytes as the address
    let addr_bytes = &hash[12..32];
    let addr = format!("0x{}", hex::encode(addr_bytes));
    Ok(addr)
}

/// Create a deployment UserOperation for a not-yet-deployed account.
pub fn create_deployment_user_op(
    account: &SmartAccount,
    init_code: Vec<u8>,
) -> Result<UserOperation, KalamError> {
    if account.is_deployed {
        return Err(KalamError::Identity("Account is already deployed".into()));
    }
    if init_code.is_empty() {
        return Err(KalamError::Identity("Init code is empty".into()));
    }

    Ok(UserOperation {
        sender: account.address.clone(),
        nonce: 0,
        init_code,
        call_data: vec![],
        verification_gas_limit: 500_000,
        call_gas_limit: 200_000,
        pre_verification_gas: 50_000,
        max_fee_per_gas: 30_000_000_000, // 30 gwei
        max_priority_fee_per_gas: 1_500_000_000, // 1.5 gwei
        paymaster_and_data: vec![],
        signature: vec![],
    })
}

/// Sign a UserOperation with the given signing key.
///
/// Computes a SHA-256 hash of the serialized UserOp fields, then signs
/// with the provided key. In production this would be an ECDSA secp256k1
/// signature; here we produce an HMAC-like deterministic signature.
pub fn sign_user_op(
    user_op: &UserOperation,
    signing_key: &SigningKey,
) -> Result<Vec<u8>, KalamError> {
    if signing_key.as_bytes().is_empty() {
        return Err(KalamError::Crypto("Signing key is empty".into()));
    }

    // Hash the user operation fields
    let mut hasher = Sha256::new();
    hasher.update(user_op.sender.as_bytes());
    hasher.update(user_op.nonce.to_le_bytes());
    hasher.update(&user_op.init_code);
    hasher.update(&user_op.call_data);
    let op_hash = hasher.finalize();

    // Sign: HMAC-like construction (key || hash)
    let mut sig_hasher = Sha256::new();
    sig_hasher.update(signing_key.as_bytes());
    sig_hasher.update(op_hash);
    let signature = sig_hasher.finalize().to_vec();

    Ok(signature)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_counterfactual_address() {
        let addr = compute_counterfactual_address(
            b"test-public-key",
            "0x1234567890abcdef1234567890abcdef12345678",
            b"salt",
        )
        .unwrap();
        assert!(addr.starts_with("0x"));
        assert_eq!(addr.len(), 42);
    }

    #[test]
    fn test_compute_address_empty_key() {
        assert!(compute_counterfactual_address(b"", "0xfactory", b"salt").is_err());
    }

    #[test]
    fn test_create_deployment_user_op() {
        let account = SmartAccount {
            address: "0x1111111111111111111111111111111111111111".into(),
            factory_address: "0xfactory".into(),
            is_deployed: false,
            salt: vec![0; 32],
        };
        let op = create_deployment_user_op(&account, vec![1, 2, 3]).unwrap();
        assert_eq!(op.nonce, 0);
        assert!(!op.init_code.is_empty());
    }

    #[test]
    fn test_create_deployment_already_deployed() {
        let account = SmartAccount {
            address: "0x1111111111111111111111111111111111111111".into(),
            factory_address: "0xfactory".into(),
            is_deployed: true,
            salt: vec![],
        };
        assert!(create_deployment_user_op(&account, vec![1]).is_err());
    }

    #[test]
    fn test_sign_user_op() {
        let op = UserOperation {
            sender: "0xsender".into(),
            nonce: 0,
            init_code: vec![],
            call_data: vec![],
            verification_gas_limit: 0,
            call_gas_limit: 0,
            pre_verification_gas: 0,
            max_fee_per_gas: 0,
            max_priority_fee_per_gas: 0,
            paymaster_and_data: vec![],
            signature: vec![],
        };
        let key = SigningKey::new(vec![1; 32]);
        let sig = sign_user_op(&op, &key).unwrap();
        assert_eq!(sig.len(), 32);
    }

    #[test]
    fn test_deterministic_address() {
        let a1 = compute_counterfactual_address(b"key", "0xfactory", b"salt").unwrap();
        let a2 = compute_counterfactual_address(b"key", "0xfactory", b"salt").unwrap();
        assert_eq!(a1, a2);
    }
}
