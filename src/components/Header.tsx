import { Search, X, ArrowLeftRight } from "lucide-react";
import { Language } from "../types";
import { t } from "../i18n";
import PinButton from "./PinButton";

interface HeaderProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isPinned?: boolean;
  onPinToggle?: () => void;
  onToggleDockEdge?: () => void;
  onExit?: () => void;
}

function Header({ language, searchQuery, onSearchChange, isPinned = false, onPinToggle, onToggleDockEdge, onExit }: HeaderProps) {
  return (
    <div 
      data-tauri-drag-region 
      className="flex items-center justify-between px-4 py-2 border-b border-gray-300 select-none"
    >
      <div className="flex items-center gap-2">
        <img src="/icon-32.png" alt="XhinkingTodo" className="w-7 h-7" />
        <h1 className="text-lg font-bold">XhinkingTodo</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* 搜索框 */}
        <div className="relative w-36">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("search.placeholder", language)}
            className="w-full pl-7 pr-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: 'var(--input-bg)' }}
          />
        </div>
        
        {/* 钉住按钮 */}
        {onPinToggle && (
          <PinButton isPinned={isPinned} onToggle={onPinToggle} language={language} />
        )}
        
        {/* 切换停靠位置按钮 */}
        {onToggleDockEdge && (
          <button
            onClick={onToggleDockEdge}
            className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            title={t("header.toggle_dock", language)}
          >
            <ArrowLeftRight size={14} />
          </button>
        )}
        
        {/* 退出按钮 */}
        {onExit && (
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            title={t("header.exit", language)}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
