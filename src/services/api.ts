import { invoke } from "@tauri-apps/api/tauri";
import { TodoItem, TodoGroup, AppData, AppSettings, ColorTag, TimeNode, WindowPosition, DockedEdge } from "../types";

export const api = {
  // 获取所有数据
  getAllData: async (): Promise<AppData> => {
    return await invoke("get_all_data");
  },

  // 待办事项操作
  createTodo: async (
    title: string,
    details: string | null,
    groupId: string,
    colorTag: ColorTag
  ): Promise<TodoItem> => {
    return await invoke("create_todo", {
      title,
      details,
      groupId,
      colorTag,
    });
  },

  updateTodo: async (
    id: string,
    updates: {
      title?: string;
      details?: string;
      groupId?: string;
      colorTag?: ColorTag;
      completed?: boolean;
      hidden?: boolean;
      archived?: boolean;
    }
  ): Promise<TodoItem> => {
    return await invoke("update_todo", {
      id,
      title: updates.title,
      details: updates.details,
      groupId: updates.groupId,
      colorTag: updates.colorTag,
      completed: updates.completed,
      hidden: updates.hidden,
      archived: updates.archived,
    });
  },

  deleteTodo: async (id: string): Promise<void> => {
    return await invoke("delete_todo", { id });
  },

  reorderTodos: async (todoIds: string[]): Promise<void> => {
    return await invoke("reorder_todos", { todoIds });
  },

  // 时间节点操作
  addTimeNode: async (
    todoId: string,
    dateTime: string,
    description: string | null,
    reminderEnabled: boolean,
    reminderMinutesBefore: number
  ): Promise<TimeNode> => {
    return await invoke("add_time_node", {
      todoId,
      dateTime,
      description,
      reminderEnabled,
      reminderMinutesBefore,
    });
  },

  updateTimeNode: async (
    id: string,
    dateTime: string,
    description: string | null,
    reminderEnabled: boolean,
    reminderMinutesBefore: number
  ): Promise<TimeNode> => {
    return await invoke("update_time_node", {
      id,
      dateTime,
      description,
      reminderEnabled,
      reminderMinutesBefore,
    });
  },

  deleteTimeNode: async (id: string): Promise<void> => {
    return await invoke("delete_time_node", { id });
  },

  // 分组操作
  createGroup: async (name: string): Promise<TodoGroup> => {
    return await invoke("create_group", { name });
  },

  updateGroup: async (id: string, name: string): Promise<TodoGroup> => {
    return await invoke("update_group", { id, name });
  },

  deleteGroup: async (id: string, moveToPersonal: boolean): Promise<void> => {
    return await invoke("delete_group", { id, moveToPersonal });
  },

  reorderGroups: async (groupIds: string[]): Promise<void> => {
    return await invoke("reorder_groups", { groupIds });
  },

  // 设置操作
  updateSettings: async (settings: AppSettings): Promise<void> => {
    return await invoke("update_settings", { settings });
  },

  // 导入导出
  exportData: async (path: string): Promise<void> => {
    return await invoke("export_data", { path });
  },

  importData: async (path: string): Promise<void> => {
    return await invoke("import_data", { path });
  },

  // 窗口位置和边缘停靠
  getWindowPosition: async (): Promise<WindowPosition> => {
    return await invoke("get_window_position");
  },

  getMonitorInfo: async (): Promise<[number, number, number, number]> => {
    return await invoke("get_monitor_info");
  },

  updateWindowPosition: async (windowPosition: WindowPosition): Promise<void> => {
    return await invoke("update_window_position", { windowPosition });
  },

  checkEdgeDocking: async (): Promise<DockedEdge | null> => {
    return await invoke("check_edge_docking");
  },

  dockToEdge: async (edge: DockedEdge): Promise<void> => {
    return await invoke("dock_to_edge", { edge });
  },

  undockWindow: async (): Promise<void> => {
    return await invoke("undock_window");
  },

  collapseToEdge: async (edge: DockedEdge, windowY: number, windowHeight: number, windowX?: number, windowWidth?: number): Promise<void> => {
    return await invoke("collapse_to_edge", { edge, windowY, windowHeight, windowX, windowWidth });
  },

  expandFromEdge: async (x: number, y: number, width: number, height: number): Promise<void> => {
    return await invoke("expand_from_edge", { x, y, width, height });
  },

  isMouseInWindow: async (): Promise<boolean> => {
    return await invoke("is_mouse_in_window");
  },
};
