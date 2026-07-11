//! Social recovery — guardian management and recovery requests.
//!
//! Recovery requires a threshold of guardian approvals plus a time delay
//! before the account ownership can be transferred.

use crate::types::Timestamp;
use crate::KalamError;
use serde::{Deserialize, Serialize};

/// Default number of guardian approvals required.
pub const DEFAULT_THRESHOLD: usize = 2;

/// Recovery delay in seconds (24 hours).
pub const RECOVERY_DELAY_SECS: u64 = 24 * 60 * 60;

/// Guardian status.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GuardianStatus {
    /// Invitation sent, not yet confirmed.
    Pending,
    /// Guardian has confirmed participation.
    Confirmed,
}

/// Recovery request status.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RecoveryStatus {
    /// Request is active and awaiting approvals.
    Active,
    /// Threshold met, waiting for delay to expire.
    Approved,
    /// Recovery executed.
    Executed,
    /// Recovery cancelled.
    Cancelled,
}

/// A guardian who can approve account recovery.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Guardian {
    /// Display name.
    pub name: String,
    /// Ethereum address of the guardian.
    pub address: String,
    /// Current status.
    pub status: GuardianStatus,
}

/// A social recovery request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryRequest {
    /// List of guardians for this recovery.
    pub guardians: Vec<Guardian>,
    /// Number of approvals required.
    pub threshold: usize,
    /// Addresses that have approved.
    pub approvals: Vec<String>,
    /// Delay in seconds after threshold is met.
    pub delay: u64,
    /// Timestamp when the request was created.
    pub created_at: Timestamp,
    /// Current status.
    pub status: RecoveryStatus,
}

/// Initiate a recovery request with the given guardians.
///
/// Requires at least `DEFAULT_THRESHOLD` confirmed guardians.
pub fn initiate_recovery(guardians: &[Guardian]) -> Result<RecoveryRequest, KalamError> {
    let confirmed = guardians
        .iter()
        .filter(|g| g.status == GuardianStatus::Confirmed)
        .count();

    if confirmed < DEFAULT_THRESHOLD {
        return Err(KalamError::Identity(format!(
            "Need at least {DEFAULT_THRESHOLD} confirmed guardians, got {confirmed}"
        )));
    }

    Ok(RecoveryRequest {
        guardians: guardians.to_vec(),
        threshold: DEFAULT_THRESHOLD,
        approvals: Vec::new(),
        delay: RECOVERY_DELAY_SECS,
        created_at: Timestamp::now(),
        status: RecoveryStatus::Active,
    })
}

/// Record a guardian approval on a recovery request.
///
/// Returns `true` if the threshold has been reached (status becomes `Approved`).
pub fn approve_recovery(
    request: &mut RecoveryRequest,
    guardian_address: &str,
    _signature: &[u8],
) -> Result<bool, KalamError> {
    // Check the address belongs to a confirmed guardian
    let is_guardian = request.guardians.iter().any(|g| {
        g.address == guardian_address && g.status == GuardianStatus::Confirmed
    });
    if !is_guardian {
        return Err(KalamError::Identity(
            "Address is not a confirmed guardian".into(),
        ));
    }

    // Prevent double approval
    if request.approvals.contains(&guardian_address.to_string()) {
        return Err(KalamError::Identity("Guardian has already approved".into()));
    }

    request.approvals.push(guardian_address.to_string());

    if request.approvals.len() >= request.threshold {
        request.status = RecoveryStatus::Approved;
        return Ok(true);
    }

    Ok(false)
}

/// Check if a recovery request is complete (threshold met AND delay expired).
pub fn is_recovery_complete(request: &RecoveryRequest) -> bool {
    if request.status != RecoveryStatus::Approved {
        return false;
    }
    let now = Timestamp::now().0;
    now >= request.created_at.0 + request.delay
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_guardians(count: usize) -> Vec<Guardian> {
        (0..count)
            .map(|i| Guardian {
                name: format!("guardian-{i}"),
                address: format!("0x{i:0>40}"),
                status: GuardianStatus::Confirmed,
            })
            .collect()
    }

    #[test]
    fn test_initiate_recovery() {
        let guardians = make_guardians(3);
        let req = initiate_recovery(&guardians).unwrap();
        assert_eq!(req.threshold, 2);
        assert_eq!(req.status, RecoveryStatus::Active);
    }

    #[test]
    fn test_initiate_not_enough_guardians() {
        let guardians = vec![Guardian {
            name: "solo".into(),
            address: "0x1".into(),
            status: GuardianStatus::Confirmed,
        }];
        assert!(initiate_recovery(&guardians).is_err());
    }

    #[test]
    fn test_approve_recovery() {
        let guardians = make_guardians(3);
        let mut req = initiate_recovery(&guardians).unwrap();

        let reached = approve_recovery(&mut req, &guardians[0].address, b"sig").unwrap();
        assert!(!reached);

        let reached = approve_recovery(&mut req, &guardians[1].address, b"sig").unwrap();
        assert!(reached);
        assert_eq!(req.status, RecoveryStatus::Approved);
    }

    #[test]
    fn test_double_approval() {
        let guardians = make_guardians(3);
        let mut req = initiate_recovery(&guardians).unwrap();
        approve_recovery(&mut req, &guardians[0].address, b"sig").unwrap();
        assert!(approve_recovery(&mut req, &guardians[0].address, b"sig").is_err());
    }

    #[test]
    fn test_non_guardian_approval() {
        let guardians = make_guardians(2);
        let mut req = initiate_recovery(&guardians).unwrap();
        assert!(approve_recovery(&mut req, "0xunknown", b"sig").is_err());
    }

    #[test]
    fn test_is_recovery_complete_not_approved() {
        let guardians = make_guardians(2);
        let req = initiate_recovery(&guardians).unwrap();
        assert!(!is_recovery_complete(&req));
    }

    #[test]
    fn test_is_recovery_complete_delay_not_elapsed() {
        let guardians = make_guardians(2);
        let mut req = initiate_recovery(&guardians).unwrap();
        req.status = RecoveryStatus::Approved;
        // created_at is now, delay is 24h — not complete
        assert!(!is_recovery_complete(&req));
    }

    #[test]
    fn test_is_recovery_complete_ready() {
        let guardians = make_guardians(2);
        let mut req = initiate_recovery(&guardians).unwrap();
        req.status = RecoveryStatus::Approved;
        req.created_at = Timestamp(0); // epoch — delay long expired
        assert!(is_recovery_complete(&req));
    }
}
