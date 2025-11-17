import { useState } from "react";
import { Check, Trash2, FileText, Calendar, Tag, Edit2 } from "lucide-react";
import TodoEditor from "./TodoEditor";
import type { TodoItem as TodoItemType, TodoGroup, Language } from "../types";
import { ColorTag } from "../types";
import { format } from "date-fns";

interface TodoItemProps {
  todo: TodoItemType;
  groups: TodoGroup[];
  language: Language;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onDelete: () => void;
}

const colorTagMap: Record<ColorTag, { color: string; label: string }> = {
  [ColorTag.Red1]: { color: "bg-tag-red", label: "红1" },
  [ColorTag.Orange2]: { color: "bg-tag-orange", label: "橙2" },
  [ColorTag.Yellow3]: { color: "bg-tag-yellow", label: "黄3" },
  [ColorTag.Green4]: { color: "bg-tag-green", label: "绿4" },
  [ColorTag.Cyan5]: { color: "bg-tag-cyan", label: "青5" },
  [ColorTag.Blue6]: { color: "bg-tag-blue", label: "蓝6" },
  [ColorTag.Purple7]: { color: "bg-tag-purple", label: "紫7" },
};

function TodoItemComponent({ todo, groups, language, onUpdate, onDelete }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleDelete = () => {
    if (confirm("确定要删除这个待办事项吗？")) {
      onDelete();
    }
  };

  const group = groups.find((g) => g.id === todo.group_id);
  const colorInfo = colorTagMap[todo.color_tag];
  const sortedTimeNodes = todo.time_nodes.length > 0
    ? [...todo.time_nodes].sort((a, b) => 
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      )
    : [];
  const nearestTimeNode = sortedTimeNodes.length > 0 ? sortedTimeNodes[0] : null;
  const hasMultipleTimeNodes = sortedTimeNodes.length > 1;

  return (
    <div
      className={`border border-gray-300 rounded-lg p-3 transition hover:shadow-md ${
        todo.completed ? "opacity-75" : ""
      }`}
      style={{ backgroundColor: todo.completed ? 'var(--bg-secondary)' : 'var(--card-bg)' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* First Line: Checkbox + Title */}
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleComplete();
          }}
          className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition"
          style={{
            backgroundColor: todo.completed ? 'var(--accent-color)' : 'transparent',
            borderColor: todo.completed ? 'var(--accent-color)' : '#9CA3AF'
          }}
          onMouseEnter={(e) => {
            if (!todo.completed) e.currentTarget.style.borderColor = 'var(--accent-color)';
          }}
          onMouseLeave={(e) => {
            if (!todo.completed) e.currentTarget.style.borderColor = '#9CA3AF';
          }}
        >
          {todo.completed && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1">
          <h3
            className={`text-sm font-medium ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {todo.title}
          </h3>

          {/* Second Line: Metadata */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
            {/* Group Badge */}
            {group && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 rounded">
                <Tag className="w-3 h-3" />
                <span>{group.name}</span>
              </div>
            )}

            {/* Color Tag */}
            <div
              className={`w-3 h-3 rounded-full ${colorInfo.color}`}
              title={colorInfo.label}
            />

            {/* Time Node */}
            {nearestTimeNode && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(nearestTimeNode.date_time), "MM/dd HH:mm")}
                  {hasMultipleTimeNodes && ` +${sortedTimeNodes.length - 1}`}
                </span>
              </div>
            )}

            {/* Details Indicator */}
            {todo.details && (
              <FileText
                className="w-3 h-3"
                style={{ color: todo.details ? 'var(--accent-color)' : '#9CA3AF' }}
              />
            )}
          </div>

          {/* Expanded Time Nodes (when multiple nodes exist) */}
          {isExpanded && hasMultipleTimeNodes && (
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                {sortedTimeNodes.map((node) => (
                  <div key={node.id} className="flex items-start gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-700 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">
                        {format(new Date(node.date_time), "MM/dd HH:mm")}
                      </span>
                    </div>
                    {node.description && (
                      <span className="text-gray-600 text-[11px] leading-tight">
                        {node.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && todo.details && (
            <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
              {todo.details}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-gray-400 transition"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <TodoEditor
          todo={todo}
          groups={groups}
          language={language}
          onSave={async (id, updates) => {
            console.log('TodoItem received save:', { id, updates });
            await onUpdate(id, updates);
            console.log('TodoItem: Update complete');
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

export default TodoItemComponent;
