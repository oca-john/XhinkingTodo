/**
 * 应用版本号配置文件
 * 
 * 这是版本号的唯一真实来源 (Single Source of Truth)
 * 
 * 使用方法：
 * 1. 修改此文件中的 APP_VERSION
 * 2. 运行构建命令（npm run build 或 npm run tauri build）
 *    版本号会在构建前自动同步到所有配置文件
 * 
 * 手动同步（可选）：
 *    npm run sync-version
 * 
 * 自动同步到以下文件：
 *    - package.json
 *    - src-tauri/Cargo.toml
 *    - src-tauri/tauri.conf.json
 * 
 * 前端代码已自动引用此文件：
 *    - App.tsx (底部信息栏)
 *    - AboutPanel.tsx (关于页面)
 *    - SettingsPanel.tsx (设置页面)
 */

export const APP_VERSION = "0.9.3";
export const APP_NAME = "XhinkingTodo";
export const APP_AUTHOR = "Oca John";
