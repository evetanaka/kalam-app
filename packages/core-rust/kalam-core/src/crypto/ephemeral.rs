//! Ephemeral messages — self-destructing messages with configurable timers.
//!
//! Timers start when a message is **read**, not when it is sent.
//! Once the timer expires, the message should be deleted from local storage.

use crate::types::Timestamp;
use serde::{Deserialize, Serialize};

/// Predefined ephemeral durations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EphemeralDuration {
    /// Ephemeral messaging disabled.
    Off,
    /// 5 minutes (300 seconds).
    FiveMinutes,
    /// 1 hour (3600 seconds).
    OneHour,
    /// 1 day (86400 seconds).
    OneDay,
    /// 1 week (604800 seconds).
    OneWeek,
}

/// Configuration for ephemeral messaging on a conversation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EphemeralConfig {
    /// Duration in seconds before messages expire after being read.
    pub duration_secs: u64,
}

/// An ephemeral message with its expiry tracking.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EphemeralMessage {
    /// Unique message identifier.
    pub message_id: Vec<u8>,
    /// Timestamp when the message expires (read_time + duration).
    pub expire_at: Timestamp,
    /// Timestamp when the message was read (timer starts here).
    pub read_at: Option<Timestamp>,
}

/// Tracks active ephemeral timers for messages.
#[derive(Debug, Clone, Default)]
pub struct EphemeralTimer {
    /// Active ephemeral messages being tracked.
    pub messages: Vec<EphemeralMessage>,
}

impl EphemeralTimer {
    /// Create a new empty timer tracker.
    pub fn new() -> Self {
        Self { messages: Vec::new() }
    }

    /// Add an ephemeral message to track.
    pub fn track(&mut self, msg: EphemeralMessage) {
        self.messages.push(msg);
    }

    /// Remove expired messages and return their IDs.
    pub fn collect_expired(&mut self, now: Timestamp) -> Vec<Vec<u8>> {
        let (expired, remaining): (Vec<_>, Vec<_>) = self
            .messages
            .drain(..)
            .partition(|m| check_expired(m, now));
        self.messages = remaining;
        expired.into_iter().map(|m| m.message_id).collect()
    }
}

/// Convert an [`EphemeralDuration`] variant to seconds.
pub fn duration_to_secs(duration: EphemeralDuration) -> u64 {
    match duration {
        EphemeralDuration::Off => 0,
        EphemeralDuration::FiveMinutes => 300,
        EphemeralDuration::OneHour => 3600,
        EphemeralDuration::OneDay => 86400,
        EphemeralDuration::OneWeek => 604800,
    }
}

/// Create an ephemeral config from a duration variant.
pub fn create_ephemeral_config(duration: EphemeralDuration) -> EphemeralConfig {
    EphemeralConfig {
        duration_secs: duration_to_secs(duration),
    }
}

/// Mark a message as ephemeral. Timer starts at `read_time`.
///
/// `expire_at` = `read_time` + `config.duration_secs`.
pub fn mark_ephemeral(
    message_id: &[u8],
    config: &EphemeralConfig,
    read_time: Timestamp,
) -> EphemeralMessage {
    EphemeralMessage {
        message_id: message_id.to_vec(),
        expire_at: Timestamp(read_time.0 + config.duration_secs),
        read_at: Some(read_time),
    }
}

/// Check whether an ephemeral message has expired.
pub fn check_expired(message: &EphemeralMessage, now: Timestamp) -> bool {
    message.read_at.is_some() && now.0 >= message.expire_at.0
}

/// Get all expired message IDs from a slice.
pub fn get_expired_messages(messages: &[EphemeralMessage], now: Timestamp) -> Vec<Vec<u8>> {
    messages
        .iter()
        .filter(|m| check_expired(m, now))
        .map(|m| m.message_id.clone())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_duration_to_secs() {
        assert_eq!(duration_to_secs(EphemeralDuration::Off), 0);
        assert_eq!(duration_to_secs(EphemeralDuration::FiveMinutes), 300);
        assert_eq!(duration_to_secs(EphemeralDuration::OneHour), 3600);
        assert_eq!(duration_to_secs(EphemeralDuration::OneDay), 86400);
        assert_eq!(duration_to_secs(EphemeralDuration::OneWeek), 604800);
    }

    #[test]
    fn test_create_config() {
        let config = create_ephemeral_config(EphemeralDuration::OneHour);
        assert_eq!(config.duration_secs, 3600);
    }

    #[test]
    fn test_mark_ephemeral() {
        let config = create_ephemeral_config(EphemeralDuration::FiveMinutes);
        let read_time = Timestamp(1000);
        let msg = mark_ephemeral(b"msg-1", &config, read_time);
        assert_eq!(msg.message_id, b"msg-1");
        assert_eq!(msg.expire_at, Timestamp(1300));
        assert_eq!(msg.read_at, Some(Timestamp(1000)));
    }

    #[test]
    fn test_check_expired() {
        let config = create_ephemeral_config(EphemeralDuration::FiveMinutes);
        let msg = mark_ephemeral(b"x", &config, Timestamp(1000));

        assert!(!check_expired(&msg, Timestamp(1100))); // not yet
        assert!(!check_expired(&msg, Timestamp(1299))); // 1 sec before
        assert!(check_expired(&msg, Timestamp(1300))); // exactly at expiry
        assert!(check_expired(&msg, Timestamp(2000))); // well past
    }

    #[test]
    fn test_unread_message_not_expired() {
        let msg = EphemeralMessage {
            message_id: b"unread".to_vec(),
            expire_at: Timestamp(0),
            read_at: None,
        };
        assert!(!check_expired(&msg, Timestamp(999999)));
    }

    #[test]
    fn test_get_expired_messages() {
        let config = create_ephemeral_config(EphemeralDuration::FiveMinutes);
        let m1 = mark_ephemeral(b"a", &config, Timestamp(100));
        let m2 = mark_ephemeral(b"b", &config, Timestamp(200));
        let m3 = mark_ephemeral(b"c", &config, Timestamp(500));

        let expired = get_expired_messages(&[m1, m2, m3], Timestamp(450));
        assert_eq!(expired.len(), 1); // only "a" (100+300=400 < 450)
        assert_eq!(expired[0], b"a");
    }

    #[test]
    fn test_ephemeral_timer() {
        let config = create_ephemeral_config(EphemeralDuration::FiveMinutes);
        let mut timer = EphemeralTimer::new();
        timer.track(mark_ephemeral(b"m1", &config, Timestamp(100)));
        timer.track(mark_ephemeral(b"m2", &config, Timestamp(300)));

        let expired = timer.collect_expired(Timestamp(450));
        assert_eq!(expired.len(), 1);
        assert_eq!(expired[0], b"m1");
        assert_eq!(timer.messages.len(), 1); // m2 still tracked
    }

    #[test]
    fn test_off_duration() {
        let config = create_ephemeral_config(EphemeralDuration::Off);
        assert_eq!(config.duration_secs, 0);
        let msg = mark_ephemeral(b"z", &config, Timestamp(100));
        // With 0 duration, expires immediately at read time
        assert!(check_expired(&msg, Timestamp(100)));
    }
}
