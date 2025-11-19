import { useState, useRef, useEffect } from "react";
import { Plus, X, Calendar, Tag, FileText } from "lucide-react";
import type { TodoGroup, ColorTag, TimeNode, Language } from "../types";
import { t } from "../i18n";

interface TodoCreatorProps {
  groups: TodoGroup[];
  language: Language;
  defaultGroupId?: string;  // 默认分组ID
  onCreate: (data: {
    title: string;
    details: string | null;
    groupId: string;
    colorTag: ColorTag;
    timeNodes: Omit<TimeNode, "id" | "created_at">[];
  }) => void;
  onCancel: () => void;
}

const colorTagOptions: { value: ColorTag; label: string; color: string }[] = [
  { value: "Red1" as ColorTag, label: "红1", color: "bg-tag-red" },
  { value: "Orange2" as ColorTag, label: "橙2", color: "bg-tag-orange" },
  { value: "Yellow3" as ColorTag, label: "黄3", color: "bg-tag-yellow" },
  { value: "Green4" as ColorTag, label: "绿4", color: "bg-tag-green" },
  { value: "Cyan5" as ColorTag, label: "青5", color: "bg-tag-cyan" },
  { value: "Blue6" as ColorTag, label: "蓝6", color: "bg-tag-blue" },
  { value: "Purple7" as ColorTag, label: "紫7", color: "bg-tag-purple" },
];

interface TempTimeNode {
  tempId: string;
  dateTime: string;
  description: string;
}

function TodoCreator({ groups, language, defaultGroupId, onCreate, onCancel }: TodoCreatorProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [groupId, setGroupId] = useState(defaultGroupId || groups[0]?.id || "");
  const [colorTag, setColorTag] = useState<ColorTag>("Green4" as ColorTag);
  const [timeNodes, setTimeNodes] = useState<TempTimeNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 聚焦输入框
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!isExpanded) {
        // 第一次按回车：展开属性面板
        setIsExpanded(true);
      }
    } else if (e.key === "Enter" && e.altKey && !e.nativeEvent.isComposing) {
      // Alt+Enter：确认创建
      e.preventDefault();
      if (title.trim()) {
        handleCreate();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleAddTimeNode = () => {
    const now = new Date();
    const dateTimeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setTimeNodes([
      ...timeNodes,
      {
        tempId: `temp-${Date.now()}`,
        dateTime: dateTimeStr,
        description: "",
      },
    ]);
  };

  const handleRemoveTimeNode = (tempId: string) => {
    setTimeNodes(timeNodes.filter((node) => node.tempId !== tempId));
  };

  const handleTimeNodeChange = (tempId: string, field: "dateTime" | "description", value: string) => {
    setTimeNodes(
      timeNodes.map((node) =>
        node.tempId === tempId ? { ...node, [field]: value } : node
      )
    );
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      details: details.trim() || null,
      groupId,
      colorTag,
      timeNodes: timeNodes.map((node) => ({
        date_time: new Date(node.dateTime).toISOString(),
        description: node.description || undefined,
        reminder_enabled: false,
        reminder_minutes_before: 0,
      })),
    });
  };

  const handleCancel = () => {
    setTitle("");
    setIsExpanded(false);
    setTimeNodes([]);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.altKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div ref={containerRef} className="border-2 border-blue-500 rounded-lg shadow-md" style={{ backgroundColor: 'var(--card-bg)' }}>
      {/* 标题输入 */}
      <div className="p-3">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={t("todo.title", language)}
          className="w-full outline-none text-sm"
          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* 展开的属性选项 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3" onKeyDown={handleKeyDown}>
          {/* 详细信息 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {t("todo.details", language)}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("editor.details_placeholder", language)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
              rows={3}
              onKeyDown={(e) => {
                // 阻止Space键冒泡，允许Enter换行
                if (e.key === ' ') {
                  e.stopPropagation();
                }
                // Enter键用于换行，但也要阻止冒泡
                if (e.key === 'Enter' && !e.altKey) {
                  e.stopPropagation();
                }
              }}
            />
          </div>

          {/* 第一行：分组、颜色标签、时间节点标题 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 分组选择 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {t("todo.group", language)}
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--input-bg)' }}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 颜色标签 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("todo.color", language)}
              </label>
              <div className="flex gap-1 flex-wrap">
                {colorTagOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setColorTag(option.value)}
                    className={`w-6 h-6 rounded border-2 transition ${
                      colorTag === option.value
                        ? "border-blue-500 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    title={option.label}
                  >
                    <div className={`w-full h-full rounded ${option.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* 时间节点 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("editor.time_nodes", language)}
              </label>
              <button
                onClick={handleAddTimeNode}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                添加
              </button>
            </div>
          </div>

          {/* 时间节点列表 */}
          {timeNodes.length > 0 && (
            <div className="space-y-2">
              {timeNodes.map((node) => (
                <div key={node.tempId} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1 space-y-1">
                    <input
                      type="datetime-local"
                      value={node.dateTime}
                      onChange={(e) => handleTimeNodeChange(node.tempId, "dateTime", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{ backgroundColor: 'var(--input-bg)' }}
                    />
                    <input
                      type="text"
                      value={node.description}
                      onChange={(e) => handleTimeNodeChange(node.tempId, "description", e.target.value)}
                      placeholder="时间节点描述（可选）"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{ backgroundColor: 'var(--input-bg)' }}
                      onKeyDown={(e) => {
                        // 阻止Enter和Space键冒泡
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveTimeNode(node.tempId)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded transition"
            >
              取消 (Esc)
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认 (Alt+Enter)
            </button>
          </div>
        </div>
      )}

      {/* 未展开时的提示 */}
      {!isExpanded && title && (
        <div className="px-3 pb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          按 Enter 展开选项
        </div>
      )}
      {/* 已展开时的提示 */}
      {isExpanded && title && (
        <div className="px-3 pb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          按 Alt+Enter 确认新建
        </div>
      )}
    </div>
  );
}

export default TodoCreator;
