import { CheckSquare, Settings, Info, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TodoGroup, Language } from "../types";
import { t } from "../i18n";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableGroupItem from "./SortableGroupItem";
import { api } from "../services/api";

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
  onGroupsReordered?: () => void;  // 分组排序后刷新回调
}

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
  onGroupsReordered,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // dnd-kit sensors配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才激活拖拽，避免误触
      },
    })
  );
  
  // 按order排序获取分组列表，并分离默认分组和自定义分组
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);
  const defaultGroups = sortedGroups.filter(g => g.is_default);
  const customGroups = sortedGroups.filter(g => !g.is_default);
  
  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };

  // dnd-kit拖拽结束处理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // 只在自定义分组中查找索引
    const oldIndex = customGroups.findIndex((group) => group.id === active.id);
    const newIndex = customGroups.findIndex((group) => group.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error('Invalid drag operation');
      return;
    }

    // 使用dnd-kit的arrayMove重新排序自定义分组
    const reorderedCustomGroups = arrayMove(customGroups, oldIndex, newIndex);
    // 合并默认分组和重新排序的自定义分组
    const allReorderedGroups = [...defaultGroups, ...reorderedCustomGroups];
    const newOrderIds = allReorderedGroups.map((group) => group.id);
    
    console.log('Groups reordered:', { oldIndex, newIndex, newOrderIds });

    try {
      // 调用API保存新顺序
      await api.reorderGroups(newOrderIds);
      // 刷新数据
      if (onGroupsReordered) {
        onGroupsReordered();
      }
    } catch (error) {
      console.error('Failed to reorder groups:', error);
    }
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'delete'>('create');
  const [dialogGroupId, setDialogGroupId] = useState<string>('');
  const [dialogGroupName, setDialogGroupName] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  // 当对话框打开时，自动聚焦到输入框
  useEffect(() => {
    if (dialogOpen && dialogType !== 'delete') {
      // 延迟聚焦，确保DOM已渲染
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [dialogOpen, dialogType]);

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
          {/* 默认分组（不可拖动） */}
          {defaultGroups.map((group) => (
            <SortableGroupItem
              key={group.id}
              group={group}
              isSelected={selectedView === "group" && selectedGroupId === group.id}
              onSelect={() => onSelectGroup(group.id)}
              onEdit={(e) => handleEditGroup(group.id, group.name, e)}
              onDelete={(e) => handleDeleteGroup(group.id, group.name, e)}
              collapsed={collapsed}
            />
          ))}
          
          {/* 自定义分组（可拖动） */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={customGroups.map((group) => group.id)}
              strategy={verticalListSortingStrategy}
            >
              {customGroups.map((group) => (
                <SortableGroupItem
                  key={group.id}
                  group={group}
                  isSelected={selectedView === "group" && selectedGroupId === group.id}
                  onSelect={() => onSelectGroup(group.id)}
                  onEdit={(e) => handleEditGroup(group.id, group.name, e)}
                  onDelete={(e) => handleDeleteGroup(group.id, group.name, e)}
                  collapsed={collapsed}
                />
              ))}
            </SortableContext>
          </DndContext>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={handleDialogCancel}
          onMouseEnter={(e) => {
            // 对话框打开时，阻止窗口折叠
            e.stopPropagation();
          }}
          onMouseMove={(e) => {
            // 持续阻止事件冒泡，防止窗口认为鼠标离开
            e.stopPropagation();
          }}
        >
          <div 
            className="rounded-lg shadow-xl w-80 max-w-[90vw]" 
            style={{ backgroundColor: 'var(--modal-bg)' }} 
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleDialogConfirm();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleDialogCancel();
              }
            }}
            tabIndex={-1} // Make div focusable to catch key events
            ref={(el) => {
              // Auto focus the dialog container if not in create/edit mode (where input is focused)
              if (el && dialogType === 'delete') {
                el.focus();
              }
            }}
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
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("dialog.group_name_placeholder", language)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--input-bg)' }}
                    onCompositionStart={(e) => {
                      e.stopPropagation();
                    }}
                    onCompositionEnd={(e) => {
                      e.stopPropagation();
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
