# XhinkingTodo

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)

一个现代化的桌面待办事项应用，基于 Tauri + Rust + React 构建。

## ✨ 功能特性

### 核心功能
- ✅ **待办管理**：创建、编辑、删除、完成待办事项
- 📁 **分组管理**：自定义分组，拖拽排序
- 🏷️ **颜色标签**：7 级颜色标签（红橙黄绿青蓝紫）表示紧急程度
- ⏰ **多时间节点**：为待办添加多个时间点和提醒
- 🔍 **快速搜索**：实时搜索待办内容

### 窗口管理
- 📌 **边缘停靠**：吸附到屏幕边缘，自动隐藏(所有平台)
- 🎨 **彩带指示器**：折叠时显示彩虹滚动指示器
- 🖱️ **悬停展开**：鼠标悬停自动展开窗口(所有平台含 Wayland)
- 📏 **记住尺寸**：自动保存和恢复窗口大小位置

### 个性化
- 🎨 **多主题**：7 种主题（白/米白/粉/黄/绿/蓝/紫）+ 深色模式
- 🌐 **多语言**：支持简体中文、繁体中文、英文
- 💾 **数据管理**：本地存储，支持导出/导入备份

### 系统集成
- 🚀 **开机自启**：可选开机自动启动
- 📍 **系统托盘**：最小化到系统托盘
- ⌨️ **快捷键**：全局快捷键支持

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0
- **Rust** >= 1.70
- **操作系统**：Windows / Linux

### 平台兼容性

**支持的操作系统**：
- ✅ **Windows 10/11**：全部功能完整支持
- ✅ **Linux (纯 Wayland)**：核心功能完整支持
- ✅ **Linux (XWayland)**：全部功能完整支持

**Wayland 说明**：

纯 Wayland 环境下，所有核心功能正常工作，包括：
- ✅ 边缘停靠
- ✅ 鼠标悬停展开
- ✅ 自动折叠
- ✅ 窗口拖拽

由于 Wayland 安全限制，部分内部安全检查使用保守策略，在极少数边缘情况下(如快速拖拽后离开窗口)行为可能与 X11 略有不同，但不影响日常使用。

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# 启动开发服务器（首次启动需 3-5 分钟编译）
npm run tauri:dev
```

开发服务器启动后：
- 前端：http://localhost:1420
- 前端修改自动热重载
- Rust 修改自动重新编译

### 生产构建

```bash
# 构建生产版本
npm run tauri:build
```

构建产物位置：
- Windows: `src-tauri/target/release/bundle/msi/` 和 `nsis/`
- Linux (RPM): `src-tauri/target/release/bundle/rpm/` (openSUSE/Fedora/RHEL)
- Linux (通用): `src-tauri/target/release/bundle/appimage/` (AppImage)

### 自动化发布

本项目已配置 GitHub Actions 自动化构建：

**自动触发**：
- 推送版本标签（如 `v-1.0.0`）自动构建并发布
- 生成 Windows/Linux 双平台安装包
- Linux 生成 `.rpm`（openSUSE/Fedora）、.deb （Debian, Ubuntu）和 `.AppImage`（通用）等格式

**Linux 发行版支持**：
- 🥇 首要支持：openSUSE (.rpm)
- 🥈 次要支持：Fedora (.rpm), Debian (.deb), Ubuntu (.deb)
- ⚙️ 通用支持：其他发行版使用 AppImage

**构建优化**：
- RPM 包使用 `opensuse/tumbleweed` 容器构建，确保在 openSUSE 上最佳表现

- 所有构建任务并行执行，约 12-15 分钟完成

**手动触发**：
- 在 GitHub Actions 页面手动运行工作流

**文档**：
- 详细发布流程：[RELEASE.md](./RELEASE.md)

## 📁 项目结构

```
XhinkingTodo-rust/
├── src/                          # 前端源码 (React + TypeScript)
│   ├── components/               # React 组件
│   │   ├── AboutPanel.tsx       # 关于页面
│   │   ├── DockIndicator.tsx    # 停靠指示器
│   │   ├── Header.tsx           # 顶部导航栏
│   │   ├── SettingsPanel.tsx    # 设置页面
│   │   ├── Sidebar.tsx          # 侧边栏（分组）
│   │   ├── TodoCreator.tsx      # 新建待办
│   │   ├── TodoEditor.tsx       # 编辑待办
│   │   ├── TodoItem.tsx         # 待办项
│   │   └── TodoList.tsx         # 待办列表
│   ├── services/                # 服务层
│   │   └── api.ts               # Tauri API 封装
│   ├── i18n/                    # 国际化
│   │   └── index.ts             # 翻译文本
│   ├── styles/                  # 样式文件
│   │   └── index.css            # 全局样式和主题
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts             # 全局类型
│   ├── version.ts               # 版本号配置（唯一真实来源）
│   ├── App.tsx                  # 主应用组件
│   └── main.tsx                 # 入口文件
├── src-tauri/                    # 后端源码 (Rust + Tauri)
│   ├── src/
│   │   ├── commands.rs          # Tauri 命令（API）
│   │   ├── models.rs            # 数据模型定义
│   │   ├── storage.rs           # 数据持久化
│   │   └── main.rs              # 主程序入口
│   ├── icons/                   # 应用图标
│   ├── Cargo.toml               # Rust 依赖配置
│   └── tauri.conf.json          # Tauri 配置
├── scripts/                      # 工具脚本
│   ├── generate_ico.py          # Windows 图标生成
│   └── sync-version.cjs         # 版本号同步脚本
├── package.json                 # Node.js 配置
├── tsconfig.json                # TypeScript 配置
├── tailwind.config.js           # TailwindCSS 配置
├── vite.config.ts               # Vite 配置
└── README.md                    # 本文件
```

## 🎨 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建**：Vite
- **样式**：TailwindCSS
- **图标**：Lucide React
- **日期**：date-fns

### 后端
- **语言**：Rust
- **框架**：Tauri 1.5
- **序列化**：serde + serde_json
- **UUID**：uuid
- **时间**：chrono

## 📖 使用指南

### 基本操作

1. **新建待办**：
   - 点击顶部"新建待办"按钮
   - 输入标题后按 Enter 展开详细选项
   - 详情文本框支持 Enter 折行
   - Alt + Enter 确认创建，Esc 取消

2. **编辑待办**：
   - 点击待办项展开详情
   - 点击"编辑"按钮
   - 详情文本框支持 Enter 折行
   - Alt + Enter 确认，Esc 取消

3. **分组管理**：
   - 点击左侧"新建分组"
   - 输入分组名称
   - Enter 确认，Esc 取消

4. **窗口停靠**：
   - 拖动窗口到屏幕边缘自动吸附
   - 点击指示器或悬停展开窗口
   - 右上角切换停靠边缘

### 数据存储

数据自动保存到本地：
- **Windows**: `%APPDATA%\com.xhinking.todo\data.json`

- **Linux**: `~/.local/share/com.xhinking.todo/data.json`

### 导入导出

1. **导出数据**：
   - 设置 → 数据管理 → 导出数据
   - 选择保存位置
   - 默认文件名：`xhinking-todo-data.json`
2. **导入数据**：
   - 设置 → 数据管理 → 导入数据
   - 选择备份文件
   - 自动重载应用

### 当前的 Bug 和未完成的开发项

1. Linux 版指示器位置未贴边
2. 为长期项目增加持久化待办（为条目增加）
3. 增加默认贴边位置（右、上）设置
4. 设置-数据管理中的目录应该由操作系统决定
5. 关于-数据存储位置中移除Macos相关对象
6. 软件开启后，隐藏任务栏图标（仅显示托盘图标）
7. 已完成待办移动到已完成分组中，已完成分组放在导航栏最下面（设置按钮上方），设置为不可重命名、不可删除、位置固定。

## 🔧 版本管理

### 版本号统一管理

本项目采用**单一来源真实性(Single Source of Truth)**原则管理版本号。

**版本号唯一来源**：`src/version.ts`

### 更新版本号流程

1. **修改版本号**：
   编辑 `src/version.ts` 中的版本号：
   ```typescript
   export const APP_VERSION = "1.0.2";  // 只需修改这里
   ```

2. **自动同步**：
   以下任一命令都会**自动**运行版本同步：
   ```bash
   npm run tauri:dev    # 开发模式 - 自动同步并启动
   npm run build        # 前端构建 - 自动同步并构建
   npm run tauri:build  # 应用打包 - 自动同步并打包
   ```

3. **手动同步（可选）**：
   ```bash
   npm run sync-version  # 仅同步版本号，不构建
   ```

### 版本号同步范围

`scripts/sync-version.cjs` 会自动将版本号同步到：

**配置文件**：
- `package.json` - Node.js 项目版本
- `src-tauri/Cargo.toml` - Rust 包版本
- `src-tauri/tauri.conf.json` - Tauri 应用版本

**前端界面**（通过 import 自动引用）：
- `App.tsx` - 底部信息栏
- `AboutPanel.tsx` - 关于页面
- `SettingsPanel.tsx` - 设置页面

### 版本号规范

采用语义化版本号 (SemVer)：`主版本.次版本.修订号`

- **主版本**：重大架构变更或不兼容的 API 修改
- **次版本**：新功能添加，向下兼容
- **修订号**：问题修复和小改进

## ⌨️ 快捷键

### 对话框
- `Enter` - 确认操作
- `Esc` - 取消操作

### 待办编辑
- 新建待办时：
  - 第一次 `Enter` - 展开详细选项
  - 第二次 `Alt + Enter` - 确认创建
  - `Esc` - 取消创建
- 编辑待办时：
  - `Alt + Enter` - 保存修改
  - `Esc` - 取消编辑

## 🐛 故障排除

### 编译问题

**Rust 编译失败**：
```bash
rustup update
```

**依赖安装失败**：
```bash
npm cache clean --force
npm install
```

### 运行问题

**窗口不显示**：
- 检查系统托盘，应用可能已最小化
- 右键托盘图标选择"显示"

**端口被占用**：
- 修改 `vite.config.ts` 中的端口号

**图标显示异常**：
- 图标资源在 `src-tauri/icons/` 目录
- 可使用 `scripts/` 中的脚本重新生成

### 数据问题

**数据丢失**：
- 检查数据文件是否存在（见上方路径）
- 尝试导入之前的备份

**导入失败**：
- 确保 JSON 文件格式正确
- 检查文件编码为 UTF-8

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👥 作者

Made with ♥️ by Oca John

---

**XhinkingTodo 1.0.2** | 思考. 记录. 创造
