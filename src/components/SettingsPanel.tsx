import { AppSettings, Theme, Language } from "../types";
import { t } from "../i18n";
import { dialog } from "@tauri-apps/api";
import { api } from "../services/api";
import { APP_VERSION, APP_NAME } from "../version";

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  sidebarCollapsed?: boolean;
}

const themeOptions = [
  { value: Theme.White, key: "theme.white", preview: "bg-[#FFFFFF]" },
  { value: Theme.MilkWhite, key: "theme.milk_white", preview: "bg-[#F8F6F1]" },
  { value: Theme.LightRed, key: "theme.light_red", preview: "bg-[#FFF0F0]" },
  { value: Theme.LightYellow, key: "theme.light_yellow", preview: "bg-[#FFF9E6]" },
  { value: Theme.LightGreen, key: "theme.light_green", preview: "bg-[#E8F5E8]" },
  { value: Theme.LightBlue, key: "theme.light_blue", preview: "bg-[#E6EEF5]" },
  { value: Theme.LightPurple, key: "theme.light_purple", preview: "bg-[#F0E6F5]" },
  { value: Theme.DarkRed, key: "theme.dark_red", preview: "bg-[#3D1F1F]" },
  { value: Theme.DarkYellow, key: "theme.dark_yellow", preview: "bg-[#4A3520]" },
  { value: Theme.DarkGreen, key: "theme.dark_green", preview: "bg-[#1F3D3D]" },
  { value: Theme.DarkBlue, key: "theme.dark_blue", preview: "bg-[#2C3A4A]" },
  { value: Theme.DarkPurple, key: "theme.dark_purple", preview: "bg-[#3A2C4A]" },
  { value: Theme.DarkGray, key: "theme.dark_gray", preview: "bg-[#2C2C2C]" },
  { value: Theme.Black, key: "theme.black", preview: "bg-[#1A1A1A]" },
];

const languageOptions = [
  { value: Language.SimplifiedChinese, key: "lang.zh_cn" },
  { value: Language.TraditionalChinese, key: "lang.zh_tw" },
  { value: Language.English, key: "lang.en" },
];

function SettingsPanel({ settings, onUpdateSettings, sidebarCollapsed = false }: SettingsPanelProps) {
  const language = settings.language;
  const handleThemeChange = (theme: Theme) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handleLanguageChange = (language: Language) => {
    onUpdateSettings({ ...settings, language });
  };

  const handleToggleHideCompleted = () => {
    onUpdateSettings({ ...settings, hide_completed: !settings.hide_completed });
  };

  const handleToggleAutoStart = () => {
    onUpdateSettings({ ...settings, auto_start: !settings.auto_start });
  };

  const handleToggleRememberWindowSize = () => {
    onUpdateSettings({ ...settings, remember_window_size: !settings.remember_window_size });
  };

  const handleExportData = async () => {
    try {
      const selected = await dialog.save({
        title: t("settings.export_data", language),
        defaultPath: "xhinking-todo-data.json",
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });
      
      if (selected) {
        await api.exportData(selected);
        await dialog.message("数据导出成功！", { title: "成功", type: "info" });
      }
    } catch (error) {
      console.error("Export failed:", error);
      await dialog.message(`导出失败：${error}`, { title: "错误", type: "error" });
    }
  };

  const handleImportData = async () => {
    try {
      const selected = await dialog.open({
        title: t("settings.import_data", language),
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }],
        multiple: false
      });
      
      if (selected && typeof selected === "string") {
        await api.importData(selected);
        await dialog.message("数据导入成功！请重启应用以查看导入的数据。", { title: "成功", type: "info" });
        // 重新加载页面以显示导入的数据
        window.location.reload();
      }
    } catch (error) {
      console.error("Import failed:", error);
      await dialog.message(`导入失败：${error}`, { title: "错误", type: "error" });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">{t("settings.title", language)}</h2>

      <div className="space-y-8">
        {/* Theme Settings */}
        <section>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">🎨</span>
            {t("settings.theme_section", language)}
          </h3>
          <div className={`grid gap-2 ${
            sidebarCollapsed ? "grid-cols-6" : "grid-cols-5"
          }`}>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                title={t(option.key, language)}
                className="aspect-square rounded-md border-2 transition"
                style={{
                  borderColor: settings.theme === option.value ? 'var(--accent-color)' : '',
                  transform: settings.theme === option.value ? 'scale(1.1)' : '',
                  boxShadow: settings.theme === option.value ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : ''
                }}
              >
                <div className={`w-full h-full rounded ${option.preview}`} />
              </button>
            ))}
          </div>
        </section>

        {/* Language Settings */}
        <section>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">🌐</span>
            {t("settings.language_section", language)}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleLanguageChange(option.value)}
                className="px-4 py-2 rounded-lg border-2 transition text-xs font-medium"
                style={{
                  backgroundColor: settings.language === option.value ? 'var(--selected-bg)' : 'var(--button-bg)',
                  borderColor: settings.language === option.value ? 'var(--accent-color)' : ''
                }}
              >
                {t(option.key, language)}
              </button>
            ))}
          </div>
        </section>

        {/* Display Settings */}
        <section>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">👁️</span>
            {t("settings.display_section", language)}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <span className="text-xs font-medium">{t("settings.hide_completed", language)}</span>
              <input
                type="checkbox"
                checked={settings.hide_completed}
                onChange={handleToggleHideCompleted}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div>
                <div className="text-xs font-medium">{t("settings.remember_window_size", language)}</div>
                <div className="text-[10px] text-gray-600">{t("settings.remember_window_size_desc", language)}</div>
              </div>
              <input
                type="checkbox"
                checked={settings.remember_window_size}
                onChange={handleToggleRememberWindowSize}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </section>

        {/* Startup Settings */}
        <section>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">🚀</span>
            {t("settings.startup_section", language)}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div>
                <div className="text-xs font-medium">{t("settings.auto_start", language)}</div>
                <div className="text-[10px] text-gray-600">{language === Language.SimplifiedChinese || language === Language.TraditionalChinese ? "系统启动时自动运行应用" : "Launch app automatically when system starts"}</div>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_start}
                onChange={handleToggleAutoStart}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-base">💾</span>
            {t("settings.data_section", language)}
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-3">
                {t("settings.data_location", language)}:
                <code className="block mt-1 p-2 bg-gray-100 border border-gray-300 rounded text-xs break-all">
                  %APPDATA%\com.xhinking.todo\data.json
                </code>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportData}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs"
                >
                  {t("settings.export_data", language)}
                </button>
                <button 
                  onClick={handleImportData}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-xs"
                >
                  {t("settings.import_data", language)}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Version Info */}
        <section className="pt-6 border-t">
          <div className="text-sm text-gray-600">
            <div>{APP_NAME} v{APP_VERSION}</div>
            <div className="mt-1">Built with Tauri + React + Rust</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPanel;
