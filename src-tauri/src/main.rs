// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod storage;
mod commands;

use std::sync::Mutex;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Manager};
use commands::*;

fn main() {
    // 创建系统托盘菜单
    let show = CustomMenuItem::new("show".to_string(), "显示");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            let config = app.config();
            let storage = storage::Storage::new(&config)
                .expect("Failed to initialize storage");
            
            let data = storage.load()
                .unwrap_or_else(|_| models::AppData::default());
            
            let app_state = AppState {
                data: Mutex::new(data),
                storage,
            };
            
            app.manage(app_state);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_data,
            create_todo,
            update_todo,
            delete_todo,
            reorder_todos,
            add_time_node,
            update_time_node,
            delete_time_node,
            create_group,
            update_group,
            delete_group,
            update_settings,
            export_data,
            import_data,
            get_window_position,
            get_monitor_info,
            update_window_position,
            check_edge_docking,
            dock_to_edge,
            undock_window,
            collapse_to_edge,
            expand_from_edge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
