//! Encrypted storage — SQLCipher-backed local database.

use crate::KalamError;
use rusqlite::Connection;

/// Encrypted database wrapper.
pub struct Database {
    /// Underlying SQLite/SQLCipher connection.
    conn: Connection,
}

impl Database {
    /// Open (or create) an encrypted database at the given path.
    ///
    /// The `key` is used as the SQLCipher encryption key.
    pub fn open(path: &str, key: &[u8]) -> Result<Self, KalamError> {
        let conn = Connection::open(path)
            .map_err(|e| KalamError::Storage(format!("Failed to open database: {e}")))?;

        // Set the encryption key via PRAGMA
        let hex_key = hex::encode(key);
        conn.execute_batch(&format!("PRAGMA key = \"x'{hex_key}'\";"))
            .map_err(|e| KalamError::Storage(format!("Failed to set encryption key: {e}")))?;

        Ok(Self { conn })
    }

    /// Initialize the database schema (creates tables if they don't exist).
    pub fn init_schema(&self) -> Result<(), KalamError> {
        self.conn
            .execute_batch(
                "
                CREATE TABLE IF NOT EXISTS accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT NOT NULL UNIQUE,
                    name TEXT,
                    passkey_credential_id BLOB,
                    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    address TEXT NOT NULL UNIQUE,
                    is_verified INTEGER NOT NULL DEFAULT 0,
                    added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );

                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL DEFAULT 'direct',
                    name TEXT,
                    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
                    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    sender_id TEXT NOT NULL,
                    ciphertext BLOB NOT NULL,
                    status TEXT NOT NULL DEFAULT 'sent',
                    type TEXT NOT NULL DEFAULT 'text',
                    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
                    expires_at INTEGER,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                );

                CREATE TABLE IF NOT EXISTS ratchet_sessions (
                    conversation_id TEXT PRIMARY KEY,
                    state BLOB NOT NULL,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                );

                CREATE TABLE IF NOT EXISTS pre_keys (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    public_key BLOB NOT NULL,
                    secret_key BLOB NOT NULL,
                    is_used INTEGER NOT NULL DEFAULT 0
                );
                ",
            )
            .map_err(|e| KalamError::Storage(format!("Failed to init schema: {e}")))?;

        Ok(())
    }

    /// Get a reference to the underlying connection (for advanced queries).
    pub fn connection(&self) -> &Connection {
        &self.conn
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_and_init_schema() {
        let db = Database::open(":memory:", b"test-key-123456").unwrap();
        db.init_schema().unwrap();

        // Verify tables exist
        let count: i64 = db
            .conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name IN ('accounts','contacts','settings','conversations','messages','ratchet_sessions','pre_keys')",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 7);
    }

    #[test]
    fn test_insert_and_query_account() {
        let db = Database::open(":memory:", b"test-key").unwrap();
        db.init_schema().unwrap();

        db.conn
            .execute(
                "INSERT INTO accounts (address, name) VALUES (?1, ?2)",
                ["0x1234567890abcdef1234567890abcdef12345678", "alice"],
            )
            .unwrap();

        let name: String = db
            .conn
            .query_row("SELECT name FROM accounts WHERE address = ?1", ["0x1234567890abcdef1234567890abcdef12345678"], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(name, "alice");
    }

    #[test]
    fn test_settings() {
        let db = Database::open(":memory:", b"key").unwrap();
        db.init_schema().unwrap();

        db.conn
            .execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                ["theme", "dark"],
            )
            .unwrap();

        let val: String = db
            .conn
            .query_row("SELECT value FROM settings WHERE key = ?1", ["theme"], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(val, "dark");
    }
}
