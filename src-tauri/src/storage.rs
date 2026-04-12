use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::models::AppData;

pub struct Storage {
    pub file: PathBuf,
}

impl Storage {
    pub fn new(dir: &Path) -> Result<Self> {
        fs::create_dir_all(dir).context("create app data dir")?;
        Ok(Self {
            file: dir.join("data.json"),
        })
    }

    pub fn load(&self) -> AppData {
        match fs::read_to_string(&self.file) {
            Ok(s) => match serde_json::from_str::<AppData>(&s) {
                Ok(data) => data,
                Err(err) => {
                    log::warn!(
                        "failed to parse {:?}: {err}; starting fresh",
                        self.file
                    );
                    // Back up the corrupt file once so we don't lose data.
                    let backup = self.file.with_extension("json.bak");
                    let _ = fs::rename(&self.file, &backup);
                    AppData::default()
                }
            },
            Err(_) => AppData::default(),
        }
    }

    pub fn save(&self, data: &AppData) -> Result<()> {
        // Write atomically: write to tmp then rename.
        let tmp = self.file.with_extension("json.tmp");
        let json =
            serde_json::to_string_pretty(data).context("serialize app data")?;
        fs::write(&tmp, json).context("write temp data file")?;
        fs::rename(&tmp, &self.file).context("rename temp data file")?;
        Ok(())
    }
}
