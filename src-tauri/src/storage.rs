use crate::models::AppData;
use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

pub struct Storage {
    pub data_path: PathBuf,
}

impl Storage {
    pub fn new(config: &tauri::Config) -> Result<Self, String> {
        let app_data_dir = app_data_dir(config)
            .ok_or_else(|| "Failed to get app data directory".to_string())?;
        
        // 创建数据目录
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
        
        let data_path = app_data_dir.join("data.json");
        
        Ok(Storage { data_path })
    }

    pub fn load(&self) -> Result<AppData, String> {
        if !self.data_path.exists() {
            return Ok(AppData::default());
        }

        let content = fs::read_to_string(&self.data_path)
            .map_err(|e| format!("Failed to read data file: {}", e))?;
        
        let data: AppData = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse data file: {}", e))?;
        
        Ok(data)
    }

    pub fn save(&self, data: &AppData) -> Result<(), String> {
        let content = serde_json::to_string_pretty(data)
            .map_err(|e| format!("Failed to serialize data: {}", e))?;
        
        fs::write(&self.data_path, content)
            .map_err(|e| format!("Failed to write data file: {}", e))?;
        
        Ok(())
    }

    pub fn export_to_file(&self, data: &AppData, path: &str) -> Result<(), String> {
        let content = serde_json::to_string_pretty(data)
            .map_err(|e| format!("Failed to serialize data: {}", e))?;
        
        fs::write(path, content)
            .map_err(|e| format!("Failed to export data: {}", e))?;
        
        Ok(())
    }

    pub fn import_from_file(&self, path: &str) -> Result<AppData, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read import file: {}", e))?;
        
        let data: AppData = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse import file: {}", e))?;
        
        Ok(data)
    }
}
