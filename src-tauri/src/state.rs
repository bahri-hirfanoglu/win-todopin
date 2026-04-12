use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use anyhow::Result;
use parking_lot::Mutex;

use crate::models::{AppData, AppSettings, Card};
use crate::storage::Storage;

/// Shared application state. `data` is the canonical in-memory source of truth.
/// A `dirty` flag is flipped on write; a background task persists it.
pub struct AppState {
    pub data: Mutex<AppData>,
    pub storage: Storage,
    dirty: AtomicBool,
}

pub type SharedState = Arc<AppState>;

impl AppState {
    pub fn new(storage: Storage) -> Self {
        let data = storage.load();
        Self {
            data: Mutex::new(data),
            storage,
            dirty: AtomicBool::new(false),
        }
    }

    pub fn mark_dirty(&self) {
        self.dirty.store(true, Ordering::Release);
    }

    pub fn take_dirty(&self) -> bool {
        self.dirty.swap(false, Ordering::AcqRel)
    }

    pub fn save_now(&self) -> Result<()> {
        let snapshot = self.data.lock().clone();
        self.storage.save(&snapshot)
    }

    /// Convenience: mutate data, mark dirty, return a value.
    pub fn with_data<R>(&self, f: impl FnOnce(&mut AppData) -> R) -> R {
        let mut guard = self.data.lock();
        let r = f(&mut guard);
        drop(guard);
        self.mark_dirty();
        r
    }

    pub fn snapshot_cards(&self) -> Vec<Card> {
        self.data.lock().cards.clone()
    }

    pub fn snapshot_settings(&self) -> AppSettings {
        self.data.lock().settings.clone()
    }
}
