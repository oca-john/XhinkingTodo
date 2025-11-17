import { CheckSquare, Settings, Info, Plus, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { TodoGroup, Language } from "../types";
import { t } from "../i18n";

interface SidebarProps {
  groups: TodoGroup[];
  language: Language;
  selectedView: string;
  selectedGroupId: string | null;
  onSelectAll: () => void;
  onSelectGroup: (groupId: string) => void;
  onSelectSettings: () => void;
  onSelectAbout: () => void;
  onCreateGroup: (name: string) => void;
  onUpdateGroup?: (id: string, name: string) => void;
  onDeleteGroup?: (id: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

import { useState } from "react";
import { X } from "lucide-react";

function Sidebar({
  groups,
  language,
  selectedView,
  selectedGroupId,
  onSelectAll,
  onSelectGroup,
  onSelectSettings,
  onSelectAbout,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCollapseChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  
  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'delete'>('create');
  const [dialogGroupId, setDialogGroupId] = useState<string>('');
  const [dialogGroupName, setDialogGroupName] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleNewGroup = () => {
    setDialogType('create');
    setInputValue('');
    setDialogOpen(true);
  };

  const handleEditGroup = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('edit');
    setDialogGroupId(id);
    setInputValue(currentName);
    setDialogOpen(true);
  };

  const handleDeleteGroup = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogType('delete');
    setDialogGroupId(id);
    setDialogGroupName(name);
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (dialogType === 'create' && inputValue.trim()) {
      onCreateGroup(inputValue.trim());
    } else if (dialogType === 'edit' && inputValue.trim() && onUpdateGroup) {
      onUpdateGroup(dialogGroupId, inputValue.trim());
    } else if (dialogType === 'delete' && onDeleteGroup) {
      onDeleteGroup(dialogGroupId);
    }
    setDialogOpen(false);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  return (
    <div className={`border-r border-gray-300 flex flex-col transition-all duration-300 ${
      collapsed ? "w-12" : "w-48"
    } max-w-[min(33vw,180px)]`}>
      {/* Collapse Toggle Button */}
      <div className={`flex items-center border-b border-gray-300 ${
        collapsed ? "justify-center py-2" : "justify-start p-2"
      }`}>
        <button
          onClick={handleToggleCollapse}
          className="p-1 hover:bg-gray-200 rounded transition flex-shrink-0"
          title={collapsed ? "展开" : "折叠"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        {!collapsed && (
          <div className="text-[10px] text-gray-500 italic ml-2 truncate">
            {t("app.slogan", language)}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* All Todos */}
        <button
          onClick={onSelectAll}
          className={`w-full py-2 text-left flex items-center gap-2 hover:bg-gray-200 transition ${
            selectedView === "all" ? "bg-gray-200 font-semibold" : ""
          } ${collapsed ? "justify-center" : "px-4"}`}
          title={collapsed ? t("nav.all_todos", language) : ""}
        >
          <CheckSquare className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t("nav.all_todos", language)}</span>}
        </button>

        {/* Groups Section */}
        <div className="mt-4">
          {!collapsed && (
            <div className="px-4 py-1 text-xs text-gray-500 uppercase font-semibold">
              {t("nav.todo_management", language)}
            </div>
          )}
          {groups
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <div
                key={group.id}
                className={`group/item flex items-center hover:bg-gray-200 transition ${
                  selectedView === "group" && selectedGroupId === group.id
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
              >
                <button
                  onClick={() => onSelectGroup(group.id)}
                  className={`flex-1 py-2 text-left text-sm flex items-center gap-2 ${
                    collapsed ? "justify-center" : "px-4"
                  }`}
                  title={collapsed ? group.name : ""}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--button-bg)', color: 'var(--accent-color)' }}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && <span>{group.name}</span>}
                </button>
                {!collapsed && (
                  <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 pr-2">
                    <button
                      onClick={(e) => handleEditGroup(group.id, group.name, e)}
                      className="p-1 hover:bg-gray-300 rounded"
                      title="编辑"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                      className="p-1 hover:bg-gray-300 rounded text-red-500"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          <button
            onClick={handleNewGroup}
            className={`w-full py-2 text-left flex items-center gap-2 text-sm text-blue-600 hover:bg-gray-200 transition ${
              collapsed ? "justify-center" : "px-4"
            }`}
            title={collapsed ? t("nav.new_group", language) : ""}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{t("nav.new_group", language)}</span>}
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-300">
        <button
          onClick={onSelectSettings}
          className={`w-full py-2 text-left flex items-center gap-2 hover:bg-gray-200 transition ${
            selectedView === "settings" ? "bg-gray-200 font-semibold" : ""
          } ${collapsed ? "justify-center" : "px-4"}`}
          title={collapsed ? t("nav.settings", language) : ""}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t("nav.settings", language)}</span>}
        </button>
        <button
          onClick={onSelectAbout}
          className={`w-full py-2 text-left flex items-center gap-2 hover:bg-gray-200 transition ${
            selectedView === "about" ? "bg-gray-200 font-semibold" : ""
          } ${collapsed ? "justify-center" : "px-4"}`}
          title={collapsed ? t("nav.about", language) : ""}
        >
          <Info className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">{t("nav.about", language)}</span>}
        </button>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleDialogCancel}>
          <div 
            className="rounded-lg shadow-xl w-80 max-w-[90vw]" 
            style={{ backgroundColor: 'var(--modal-bg)' }} 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleDialogConfirm();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleDialogCancel();
              }
            }}
            tabIndex={-1}
            ref={(el) => el?.focus()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">
                {dialogType === 'create' && t("nav.new_group", language)}
                {dialogType === 'edit' && t("dialog.edit_group", language)}
                {dialogType === 'delete' && t("button.delete", language)}
              </h3>
              <button onClick={handleDialogCancel} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              {dialogType !== 'delete' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dialog.group_name", language)}
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("dialog.group_name_placeholder", language)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--input-bg)' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleDialogConfirm();
                      } else if (e.key === 'Escape') {
                        handleDialogCancel();
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  {t("dialog.delete_group_confirm", language).replace('{name}', dialogGroupName)}
                  <br />
                  <span className="font-semibold">"{dialogGroupName}"</span>
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
              <button
                onClick={handleDialogCancel}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition"
              >
                {t("button.cancel", language)} (Esc)
              </button>
              <button
                onClick={handleDialogConfirm}
                className={`px-4 py-2 text-sm text-white rounded transition ${
                  dialogType === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {dialogType === 'delete' ? `${t("button.delete", language)} (Enter)` : `${t("button.confirm", language)} (Enter)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
