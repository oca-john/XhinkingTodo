use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoItem {
    pub id: String,
    pub title: String,
    pub details: Option<String>,
    pub group_id: String,
    pub color_tag: ColorTag,
    pub completed: bool,
    pub hidden: bool,
    pub archived: bool,
    pub archived_at: Option<DateTime<Utc>>,
    pub order: i32,
    pub parent_id: Option<String>,
    pub time_nodes: Vec<TimeNode>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubTask {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub order: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoGroup {
    pub id: String,
    pub name: String,
    pub order: i32,
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeNode {
    pub id: String,
    pub date_time: DateTime<Utc>,
    pub description: Option<String>,
    pub reminder_enabled: bool,
    pub reminder_minutes_before: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ColorTag {
    Red1,    // 最紧急
    Orange2,
    Yellow3,
    Green4,
    Cyan5,
    Blue6,   // 默认
    Purple7, // 长期任务
}

impl Default for ColorTag {
    fn default() -> Self {
        ColorTag::Blue6
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: Theme,
    pub language: Language,
    pub auto_start: bool,
    pub edge_docking: bool,
    pub hide_completed: bool,
    pub remember_window_size: bool,
    pub window_position: WindowPosition,
    #[serde(default = "default_docked_edge")]
    pub default_docked_edge: DockedEdge,
}

fn default_docked_edge() -> DockedEdge {
    DockedEdge::Right
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPosition {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub docked_edge: Option<DockedEdge>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum DockedEdge {
    Left,
    Right,
    Top,
    Bottom,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Theme {
    White,
    MilkWhite,
    LightRed,
    LightYellow,
    LightGreen,
    LightBlue,
    LightPurple,
    DarkRed,
    DarkYellow,
    DarkGreen,
    DarkBlue,
    DarkPurple,
    DarkGray,
    Black,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Language {
    SimplifiedChinese,
    TraditionalChinese,
    English,
}

impl Default for AppSettings {
    fn default() -> Self {
        AppSettings {
            theme: Theme::MilkWhite,
            language: Language::SimplifiedChinese,
            auto_start: false,
            edge_docking: true,
            hide_completed: false,
            remember_window_size: false,
            window_position: WindowPosition {
                x: 1400.0,
                y: 100.0,
                width: 384.0,
                height: 720.0,
                docked_edge: Some(DockedEdge::Right),
            },
            default_docked_edge: DockedEdge::Right,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppData {
    pub todos: Vec<TodoItem>,
    pub groups: Vec<TodoGroup>,
    pub settings: AppSettings,
}

impl Default for AppData {
    fn default() -> Self {
        let personal_group = TodoGroup {
            id: "personal".to_string(),
            name: "个人".to_string(),
            order: 0,
            is_default: true,
            created_at: Utc::now(),
        };

        AppData {
            todos: Vec::new(),
            groups: vec![personal_group],
            settings: AppSettings::default(),
        }
    }
}
