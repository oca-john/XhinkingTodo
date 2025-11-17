import { useState, useEffect, useRef } from "react";
import { X, Calendar, Tag, FileText, Plus, Trash2 } from "lucide-react";
import type { TodoItem, TodoGroup, ColorTag, TimeNode, Language } from "../types";
import { format } from "date-fns";
import { t } from "../i18n";

interface TodoEditorProps {
  todo: TodoItem;
  groups: TodoGroup[];
  language: Language;
  onSave: (id: string, updates: {
    title: string;
    details: string | null;
    groupId: string;
    colorTag: ColorTag;
    timeNodes: TimeNode[];
  }) => Promise<void>;
  onClose: () => void;
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

function TodoEditor({ todo, groups, language, onSave, onClose }: TodoEditorProps) {
  const [title, setTitle] = useState(todo.title);
  const [details, setDetails] = useState(todo.details || "");
  const [groupId, setGroupId] = useState(todo.group_id);
  const [colorTag, setColorTag] = useState(todo.color_tag);
  const [timeNodes, setTimeNodes] = useState<TimeNode[]>(todo.time_nodes);
  const dialogRef = useRef<HTMLDivElement>(null);

  // 在组件挂载时聚焦对话框，以便立即响应Esc键
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleSave = async () => {
    console.log('TodoEditor handleSave called with:', {
      id: todo.id,
      title,
      details,
      groupId,
      colorTag,
      timeNodes
    });
    
    try {
      await onSave(todo.id, {
        title,
        details: details || null,
        groupId,
        colorTag,
        timeNodes,
      });
      console.log('TodoEditor: Save completed, closing dialog');
      onClose();
    } catch (error) {
      console.error('TodoEditor: Save failed:', error);
      // 即使失败也关闭对话框
      onClose();
    }
  };

  const handleAddTimeNode = () => {
    const now = new Date();
    const newNode: TimeNode = {
      id: `temp-${Date.now()}`,
      date_time: now.toISOString(),
      description: "",
      reminder_enabled: false,
      reminder_minutes_before: 0,
      created_at: now.toISOString(),
    };
    setTimeNodes([...timeNodes, newNode]);
  };

  const handleRemoveTimeNode = (id: string) => {
    setTimeNodes(timeNodes.filter((node) => node.id !== id));
  };

  const handleTimeNodeChange = (id: string, field: keyof TimeNode, value: any) => {
    setTimeNodes(
      timeNodes.map((node) =>
        node.id === id ? { ...node, [field]: value } : node
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={dialogRef}
        className="rounded-lg shadow-xl w-full max-w-[calc(100vw-8rem)] max-h-[min(75vh,640px)] overflow-hidden flex flex-col" 
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        onMouseDown={(e) => {
          // 防止点击对话框内部时重新聚焦到容器
          if (e.target === e.currentTarget) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{t("editor.edit_todo", language)}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("todo.title", language)}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'var(--input-bg)' }}
              placeholder={t("editor.title_placeholder", language)}
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t("todo.details", language)}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ backgroundColor: 'var(--input-bg)' }}
              rows={4}
              placeholder={t("editor.details_placeholder", language)}
            />
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t("todo.group", language)}
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: 'var(--input-bg)' }}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("todo.color", language)}
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorTagOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColorTag(option.value)}
                  className={`px-3 py-2 rounded-md border-2 transition flex items-center gap-2 ${
                    colorTag === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Nodes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("editor.time_nodes", language)}
            </label>
            {timeNodes.length > 0 ? (
              <div className="space-y-2">
                {timeNodes.map((node) => {
                  const dateTimeStr = format(new Date(node.date_time), "yyyy-MM-dd'T'HH:mm");
                  return (
                    <div
                      key={node.id}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded border"
                    >
                      <div className="flex-1 space-y-2">
                        <input
                          type="datetime-local"
                          value={dateTimeStr}
                          onChange={(e) => {
                            const newDateTime = new Date(e.target.value).toISOString();
                            handleTimeNodeChange(node.id, "date_time", newDateTime);
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: 'var(--input-bg)' }}
                        />
                        <input
                          type="text"
                          value={node.description || ""}
                          onChange={(e) => handleTimeNodeChange(node.id, "description", e.target.value)}
                          placeholder="时间节点描述（可选）"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ backgroundColor: 'var(--input-bg)' }}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveTimeNode(node.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">暂无时间节点</div>
            )}
            <button
              onClick={handleAddTimeNode}
              className="mt-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t("editor.add_time_node", language)}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
          >
            {t("button.cancel", language)} (Esc)
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("button.update", language)} (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoEditor;
