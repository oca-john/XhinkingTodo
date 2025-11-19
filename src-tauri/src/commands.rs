use crate::models::*;
use crate::storage::Storage;
use std::sync::Mutex;
use tauri::{State, Window, PhysicalPosition};
use chrono::Utc;
use auto_launch::AutoLaunch;

pub struct AppState {
    pub data: Mutex<AppData>,
    pub storage: Storage,
}

#[tauri::command]
pub fn get_all_data(state: State<AppState>) -> Result<AppData, String> {
    let data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(data.clone())
}

#[tauri::command]
pub fn create_todo(
    title: String,
    details: Option<String>,
    group_id: String,
    color_tag: ColorTag,
    state: State<AppState>,
) -> Result<TodoItem, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let todo = TodoItem {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        details,
        group_id,
        color_tag,
        completed: false,
        hidden: false,
        archived: false,
        archived_at: None,
        order: data.todos.len() as i32,
        parent_id: None,
        time_nodes: Vec::new(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    
    data.todos.push(todo.clone());
    state.storage.save(&data)?;
    
    Ok(todo)
}

#[tauri::command]
pub fn update_todo(
    id: String,
    title: Option<String>,
    details: Option<String>,
    group_id: Option<String>,
    color_tag: Option<ColorTag>,
    completed: Option<bool>,
    hidden: Option<bool>,
    archived: Option<bool>,
    state: State<AppState>,
) -> Result<TodoItem, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let todo = data.todos.iter_mut()
        .find(|t| t.id == id)
        .ok_or_else(|| "Todo not found".to_string())?;
    
    if let Some(title) = title {
        todo.title = title;
    }
    if let Some(details) = details {
        todo.details = Some(details);
    }
    if let Some(group_id) = group_id {
        todo.group_id = group_id;
    }
    if let Some(color_tag) = color_tag {
        todo.color_tag = color_tag;
    }
    if let Some(completed) = completed {
        todo.completed = completed;
    }
    if let Some(hidden) = hidden {
        todo.hidden = hidden;
    }
    if let Some(archived) = archived {
        todo.archived = archived;
        if archived {
            todo.archived_at = Some(Utc::now());
        } else {
            todo.archived_at = None;
        }
    }
    
    todo.updated_at = Utc::now();
    let updated_todo = todo.clone();
    
    state.storage.save(&data)?;
    
    Ok(updated_todo)
}

#[tauri::command]
pub fn delete_todo(id: String, state: State<AppState>) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    data.todos.retain(|t| t.id != id);
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn reorder_todos(todo_ids: Vec<String>, state: State<AppState>) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    for (index, id) in todo_ids.iter().enumerate() {
        if let Some(todo) = data.todos.iter_mut().find(|t| &t.id == id) {
            todo.order = index as i32;
        }
    }
    
    state.storage.save(&data)?;
    Ok(())
}

#[tauri::command]
pub fn add_time_node(
    todo_id: String,
    date_time: String,
    description: Option<String>,
    reminder_enabled: bool,
    reminder_minutes_before: i32,
    state: State<AppState>,
) -> Result<TimeNode, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let todo = data.todos.iter_mut()
        .find(|t| t.id == todo_id)
        .ok_or_else(|| "Todo not found".to_string())?;
    
    let parsed_date = chrono::DateTime::parse_from_rfc3339(&date_time)
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    let time_node = TimeNode {
        id: uuid::Uuid::new_v4().to_string(),
        date_time: parsed_date.with_timezone(&Utc),
        description,
        reminder_enabled,
        reminder_minutes_before,
        created_at: Utc::now(),
    };
    
    todo.time_nodes.push(time_node.clone());
    todo.updated_at = Utc::now();
    
    state.storage.save(&data)?;
    
    Ok(time_node)
}

#[tauri::command]
pub fn update_time_node(
    id: String,
    date_time: String,
    description: Option<String>,
    reminder_enabled: bool,
    reminder_minutes_before: i32,
    state: State<AppState>,
) -> Result<TimeNode, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // 找到包含该时间节点的todo
    let todo = data.todos.iter_mut()
        .find(|t| t.time_nodes.iter().any(|tn| tn.id == id))
        .ok_or_else(|| "Time node not found".to_string())?;
    
    // 找到并更新时间节点
    let time_node = todo.time_nodes.iter_mut()
        .find(|tn| tn.id == id)
        .ok_or_else(|| "Time node not found".to_string())?;
    
    let parsed_date = chrono::DateTime::parse_from_rfc3339(&date_time)
        .map_err(|e| format!("Invalid date format: {}", e))?;
    
    time_node.date_time = parsed_date.with_timezone(&Utc);
    time_node.description = description;
    time_node.reminder_enabled = reminder_enabled;
    time_node.reminder_minutes_before = reminder_minutes_before;
    
    let updated_node = time_node.clone();
    todo.updated_at = Utc::now();
    
    state.storage.save(&data)?;
    
    Ok(updated_node)
}

#[tauri::command]
pub fn delete_time_node(
    id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // 找到包含该时间节点的todo
    let todo = data.todos.iter_mut()
        .find(|t| t.time_nodes.iter().any(|tn| tn.id == id))
        .ok_or_else(|| "Time node not found".to_string())?;
    
    // 删除时间节点
    todo.time_nodes.retain(|tn| tn.id != id);
    todo.updated_at = Utc::now();
    
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn create_group(name: String, state: State<AppState>) -> Result<TodoGroup, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let group = TodoGroup {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        order: data.groups.len() as i32,
        is_default: false,
        created_at: Utc::now(),
    };
    
    data.groups.push(group.clone());
    state.storage.save(&data)?;
    
    Ok(group)
}

#[tauri::command]
pub fn update_group(
    id: String,
    name: String,
    state: State<AppState>,
) -> Result<TodoGroup, String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let group = data.groups.iter_mut()
        .find(|g| g.id == id)
        .ok_or_else(|| "Group not found".to_string())?;
    
    if group.is_default {
        return Err("Cannot modify default group".to_string());
    }
    
    group.name = name;
    let updated_group = group.clone();
    
    state.storage.save(&data)?;
    
    Ok(updated_group)
}

#[tauri::command]
pub fn delete_group(
    id: String,
    move_to_personal: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    let group = data.groups.iter()
        .find(|g| g.id == id)
        .ok_or_else(|| "Group not found".to_string())?;
    
    if group.is_default {
        return Err("Cannot delete default group".to_string());
    }
    
    // 如果需要移动待办到personal分组
    if move_to_personal {
        for todo in data.todos.iter_mut() {
            if todo.group_id == id {
                todo.group_id = "personal".to_string();
            }
        }
    } else {
        // 否则删除该分组的所有待办
        data.todos.retain(|t| t.group_id != id);
    }
    
    // 删除分组
    data.groups.retain(|g| g.id != id);
    
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn reorder_groups(group_ids: Vec<String>, state: State<AppState>) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    for (index, id) in group_ids.iter().enumerate() {
        if let Some(group) = data.groups.iter_mut().find(|g| &g.id == id) {
            group.order = index as i32;
        }
    }
    
    state.storage.save(&data)?;
    Ok(())
}

#[tauri::command]
pub fn update_settings(
    mut settings: AppSettings,
    state: State<AppState>,
) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // Handle auto_start change
    let old_auto_start = data.settings.auto_start;
    let new_auto_start = settings.auto_start;
    
    if old_auto_start != new_auto_start {
        let app_name = "XhinkingTodo";
        let app_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?;
        
        let auto = AutoLaunch::new(
            app_name,
            app_path.to_str().ok_or("Invalid executable path")?,
            &[] as &[&str],
        );
        
        if new_auto_start {
            auto.enable()
                .map_err(|e| format!("Failed to enable auto-start: {}", e))?;
        } else {
            auto.disable()
                .map_err(|e| format!("Failed to disable auto-start: {}", e))?;
        }
    }
    
    // Handle remember_window_size change
    // 如果关闭记住窗口大小，且前端未传递默认值，则自动重置
    let old_remember = data.settings.remember_window_size;
    let new_remember = settings.remember_window_size;
    
    if old_remember && !new_remember {
        // 重置为默认值
        settings.window_position = WindowPosition {
            x: 1400.0,
            y: 100.0,
            width: 384.0,
            height: 720.0,
            docked_edge: Some(DockedEdge::Right),
        };
        println!("🗑️ 关闭记住窗口大小，重置 window_position 为默认值");
    }
    
    data.settings = settings;
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn export_data(path: String, state: State<AppState>) -> Result<(), String> {
    let data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    state.storage.export_to_file(&data, &path)?;
    
    Ok(())
}

#[tauri::command]
pub fn import_data(path: String, state: State<AppState>) -> Result<(), String> {
    let imported_data = state.storage.import_from_file(&path)?;
    
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    *data = imported_data;
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn get_window_position(window: Window) -> Result<WindowPosition, String> {
    let position = window.outer_position()
        .map_err(|e| format!("Failed to get window position: {}", e))?;
    let size = window.outer_size()
        .map_err(|e| format!("Failed to get window size: {}", e))?;
    
    Ok(WindowPosition {
        x: position.x as f64,
        y: position.y as f64,
        width: size.width as f64,
        height: size.height as f64,
        docked_edge: None,
    })
}

#[tauri::command]
pub fn get_monitor_info(window: Window) -> Result<(i32, i32, u32, u32), String> {
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?
        .ok_or("No monitor found")?;
    
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();
    
    Ok((monitor_pos.x, monitor_pos.y, monitor_size.width, monitor_size.height))
}

#[tauri::command]
pub fn update_window_position(
    window_position: WindowPosition,
    state: State<AppState>,
) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    data.settings.window_position = window_position;
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn check_edge_docking(
    window: Window,
    state: State<AppState>,
) -> Result<Option<DockedEdge>, String> {
    let data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // 如果边缘停靠功能未开启，返回 None
    if !data.settings.edge_docking {
        return Ok(None);
    }
    
    let position = window.outer_position()
        .map_err(|e| format!("Failed to get window position: {}", e))?;
    
    // 获取当前显示器信息
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?
        .ok_or("No monitor found")?;
    
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();
    
    let x = position.x;
    let y = position.y;
    
    // 定义停靠阈值（15像素）
    const DOCK_THRESHOLD: i32 = 15;
    
    // 检查是否靠近边缘（只支持上、右两个边缘）
    let window_width = window.outer_size().map_err(|e| format!("{}", e))?.width as i32;
    
    // 计算窗口右边缘到屏幕右边缘的距离
    let distance_to_right = (monitor_pos.x + monitor_size.width as i32) - (x + window_width);
    // 计算窗口顶边到屏幕顶边的距离
    let distance_to_top = y - monitor_pos.y;
    
    // 返回最近的边缘（优先右侧）
    if distance_to_right >= 0 && distance_to_right < DOCK_THRESHOLD {
        Ok(Some(DockedEdge::Right))
    } else if distance_to_top >= 0 && distance_to_top < DOCK_THRESHOLD {
        Ok(Some(DockedEdge::Top))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn dock_to_edge(
    window: Window,
    edge: DockedEdge,
    state: State<AppState>,
) -> Result<(), String> {
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?
        .ok_or("No monitor found")?;
    
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();
    let window_size = window.outer_size()
        .map_err(|e| format!("Failed to get window size: {}", e))?;
    
    // 根据边缘设置窗口位置
    let new_pos = match edge {
        DockedEdge::Left => PhysicalPosition::new(monitor_pos.x, monitor_pos.y + (monitor_size.height as i32 / 3)),
        DockedEdge::Right => PhysicalPosition::new(
            monitor_pos.x + monitor_size.width as i32 - window_size.width as i32,
            monitor_pos.y + (monitor_size.height as i32 / 3),
        ),
        DockedEdge::Top => PhysicalPosition::new(
            monitor_pos.x + (monitor_size.width as i32 / 2) - (window_size.width as i32 / 2),
            monitor_pos.y,
        ),
        DockedEdge::Bottom => PhysicalPosition::new(
            monitor_pos.x + (monitor_size.width as i32 / 2) - (window_size.width as i32 / 2),
            monitor_pos.y + monitor_size.height as i32 - window_size.height as i32,
        ),
    };
    
    window.set_position(new_pos)
        .map_err(|e| format!("Failed to set window position: {}", e))?;
    
    // 更新保存的窗口位置
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    data.settings.window_position.x = new_pos.x as f64;
    data.settings.window_position.y = new_pos.y as f64;
    data.settings.window_position.docked_edge = Some(edge);
    
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn undock_window(state: State<AppState>) -> Result<(), String> {
    let mut data = state.data.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    
    data.settings.window_position.docked_edge = None;
    state.storage.save(&data)?;
    
    Ok(())
}

#[tauri::command]
pub fn collapse_to_edge(
    window: Window,
    edge: DockedEdge,
    window_y: i32,
    window_height: u32,
    window_x: Option<i32>,
    window_width: Option<u32>,
) -> Result<(), String> {
    const INDICATOR_THICKNESS: u32 = 2;
    
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?
        .ok_or("No monitor found")?;
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();
    
    // 折叠窗口：调整窗口大小为2px，并移动到屏幕边缘内侧
    match edge {
        DockedEdge::Right => {
            // 右侧停靠：宽度变为2px，保持高度，移到屏幕右边缘内侧
            // Linux 需要先设置大小再设置位置，以确保正确计算
            #[cfg(target_os = "linux")]
            {
                window.set_size(tauri::PhysicalSize::new(INDICATOR_THICKNESS, window_height))
                    .map_err(|e| format!("Failed to set window size: {}", e))?;
                let new_x = monitor_pos.x + monitor_size.width as i32 - INDICATOR_THICKNESS as i32;
                window.set_position(PhysicalPosition::new(new_x, window_y))
                    .map_err(|e| format!("Failed to set window position: {}", e))?;
            }
            
            // Windows 保持原有逻辑：先设置位置再设置大小
            #[cfg(not(target_os = "linux"))]
            {
                let new_x = monitor_pos.x + monitor_size.width as i32 - INDICATOR_THICKNESS as i32;
                window.set_position(PhysicalPosition::new(new_x, window_y))
                    .map_err(|e| format!("Failed to set window position: {}", e))?;
                window.set_size(tauri::PhysicalSize::new(INDICATOR_THICKNESS, window_height))
                    .map_err(|e| format!("Failed to set window size: {}", e))?;
            }
        },
        DockedEdge::Top => {
            // 顶部停靠：高度变为2px，保持宽度，移到屏幕顶部
            let x_pos = window_x.unwrap_or_else(|| {
                window.outer_position().map(|p| p.x).unwrap_or(monitor_pos.x)
            });
            let width = window_width.unwrap_or_else(|| {
                window.outer_size().map(|s| s.width).unwrap_or(800)
            });
            window.set_position(PhysicalPosition::new(x_pos, monitor_pos.y))
                .map_err(|e| format!("Failed to set window position: {}", e))?;
            window.set_size(tauri::PhysicalSize::new(width, INDICATOR_THICKNESS))
                .map_err(|e| format!("Failed to set window size: {}", e))?;
        },
        _ => return Err("Unsupported docked edge".to_string()),
    };
    
    Ok(())
}

#[tauri::command]
pub fn expand_from_edge(
    window: Window,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<(), String> {
    let pos = PhysicalPosition::new(x, y);
    let size = tauri::PhysicalSize::new(width, height);
    
    // 恢复窗口位置和大小
    window.set_position(pos)
        .map_err(|e| format!("Failed to set window position: {}", e))?;
    window.set_size(size)
        .map_err(|e| format!("Failed to set window size: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn is_mouse_in_window(window: Window) -> Result<bool, String> {
    // 获取窗口位置和大小
    let window_pos = window.outer_position()
        .map_err(|e| format!("Failed to get window position: {}", e))?;
    let window_size = window.outer_size()
        .map_err(|e| format!("Failed to get window size: {}", e))?;
    
    // 计算窗口边界(共享逻辑)
    let window_left = window_pos.x;
    let window_right = window_pos.x + window_size.width as i32;
    let window_top = window_pos.y;
    let window_bottom = window_pos.y + window_size.height as i32;
    
    // 获取鼠标位置 - Windows 实现
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
        use windows::Win32::Foundation::POINT;
        
        unsafe {
            let mut point = POINT { x: 0, y: 0 };
            if GetCursorPos(&mut point).is_ok() {
                let mouse_x = point.x;
                let mouse_y = point.y;
                
                // 检查鼠标是否在窗口范围内
                let in_window = mouse_x >= window_left 
                    && mouse_x < window_right
                    && mouse_y >= window_top 
                    && mouse_y < window_bottom;
                
                return Ok(in_window);
            }
        }
        // Windows API 调用失败时返回 false
        return Ok(false);
    }
    
    // 获取鼠标位置 - Linux 实现
    #[cfg(target_os = "linux")]
    {
        use mouse_position::mouse_position::Mouse;
        
        let position = Mouse::get_mouse_position();
        match position {
            Mouse::Position { x, y } => {
                // 检查鼠标是否在窗口范围内
                let in_window = x >= window_left 
                    && x < window_right
                    && y >= window_top 
                    && y < window_bottom;
                
                return Ok(in_window);
            }
            Mouse::Error => {
                // Wayland 环境或其他错误
                // 返回 false,让应用依赖 Web 事件处理
                // 这是预期行为,不打印错误日志
                return Ok(false);
            }
        }
    }
    
    // 其他平台默认返回false
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    Ok(false)
}
