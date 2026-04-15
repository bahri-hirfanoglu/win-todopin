use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CardTheme {
    Peach,
    Lavender,
    Mint,
    Sky,
    Sunny,
    Rose,
    Slate,
}

impl Default for CardTheme {
    fn default() -> Self {
        CardTheme::Peach
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CardMode {
    /// Always on top of other windows.
    Pinned,
    /// Sits on desktop, does not stay on top, excluded from taskbar.
    Widget,
}

impl Default for CardMode {
    fn default() -> Self {
        CardMode::Pinned
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoItem {
    pub id: String,
    pub text: String,
    pub done: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CardPosition {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Default for CardPosition {
    fn default() -> Self {
        Self {
            x: 120,
            y: 120,
            width: 320,
            height: 420,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Card {
    pub id: String,
    pub title: String,
    pub theme: CardTheme,
    pub mode: CardMode,
    pub todos: Vec<TodoItem>,
    pub position: CardPosition,
    pub visible: bool,
    #[serde(default)]
    pub minimized: bool,
    #[serde(default)]
    pub expanded_height: Option<u32>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    Tr,
    En,
}

impl Default for Language {
    fn default() -> Self {
        Language::Tr
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AppTheme {
    Default,
    Windows,
    Macos,
    Github,
    Nord,
    Dracula,
}

impl std::default::Default for AppTheme {
    fn default() -> Self {
        AppTheme::Default
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Shortcuts {
    pub show_all: String,
    pub hide_all: String,
    pub new_card: String,
    pub open_manager: String,
}

impl Default for Shortcuts {
    fn default() -> Self {
        Self {
            show_all: "Ctrl+Shift+S".into(),
            hide_all: "Ctrl+Shift+H".into(),
            new_card: "Ctrl+Shift+N".into(),
            open_manager: "Ctrl+Shift+M".into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub language: Language,
    pub autostart: bool,
    pub default_theme: CardTheme,
    #[serde(default)]
    pub app_theme: AppTheme,
    #[serde(default)]
    pub shortcuts: Shortcuts,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: Language::default(),
            autostart: false,
            default_theme: CardTheme::default(),
            app_theme: AppTheme::default(),
            shortcuts: Shortcuts::default(),
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub cards: Vec<Card>,
    pub settings: AppSettings,
}
