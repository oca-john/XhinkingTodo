export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  group_id: string;
  color_tag: ColorTag;
  completed: boolean;
  hidden: boolean;
  archived: boolean;
  archived_at?: string;
  order: number;
  parent_id?: string;
  time_nodes: TimeNode[];
  created_at: string;
  updated_at: string;
}

export interface TodoGroup {
  id: string;
  name: string;
  order: number;
  is_default: boolean;
  created_at: string;
}

export interface TimeNode {
  id: string;
  date_time: string;
  description?: string;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  created_at: string;
}

export enum ColorTag {
  Red1 = "Red1",
  Orange2 = "Orange2",
  Yellow3 = "Yellow3",
  Green4 = "Green4",
  Cyan5 = "Cyan5",
  Blue6 = "Blue6",
  Purple7 = "Purple7",
}

export enum Theme {
  White = "White",
  MilkWhite = "MilkWhite",
  LightRed = "LightRed",
  LightYellow = "LightYellow",
  LightGreen = "LightGreen",
  LightBlue = "LightBlue",
  LightPurple = "LightPurple",
  DarkRed = "DarkRed",
  DarkYellow = "DarkYellow",
  DarkGreen = "DarkGreen",
  DarkBlue = "DarkBlue",
  DarkPurple = "DarkPurple",
  DarkGray = "DarkGray",
  Black = "Black",
}

export enum Language {
  SimplifiedChinese = "SimplifiedChinese",
  TraditionalChinese = "TraditionalChinese",
  English = "English",
}

export enum DockedEdge {
  Left = "Left",
  Right = "Right",
  Top = "Top",
  Bottom = "Bottom",
}

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  docked_edge?: DockedEdge;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  auto_start: boolean;
  edge_docking: boolean;
  hide_completed: boolean;
  remember_window_size: boolean;
  window_position: WindowPosition;
  default_docked_edge: DockedEdge;
}

export interface AppData {
  todos: TodoItem[];
  groups: TodoGroup[];
  settings: AppSettings;
}
