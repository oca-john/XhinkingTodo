import { useState } from "react";
import { Plus } from "lucide-react";
import { TodoItem, TodoGroup, Language, ColorTag, TimeNode } from "../types";
import { t } from "../i18n";
import TodoItemComponent from "./TodoItem";
import TodoCreator from "./TodoCreator";

interface TodoListProps {
  todos: TodoItem[];
  groups: TodoGroup[];
  language: Language;
  currentGroupId?: string;  // 当前选中的分组ID
  onCreateTodo: (data: {
    title: string;
    details: string | null;
    groupId: string;
    colorTag: ColorTag;
    timeNodes: Omit<TimeNode, "id" | "created_at">[];
  }) => void;
  onUpdateTodo: (id: string, updates: any) => Promise<void>;
  onDeleteTodo: (id: string) => void;
}

function TodoList({
  todos,
  groups,
  language,
  currentGroupId,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
}: TodoListProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (data: {
    title: string;
    details: string | null;
    groupId: string;
    colorTag: ColorTag;
    timeNodes: Omit<TimeNode, "id" | "created_at">[];
  }) => {
    onCreateTodo(data);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* New Todo Input */}
        <div className="mb-4">
          {isCreating ? (
            <TodoCreator
              groups={groups}
              language={language}
              defaultGroupId={currentGroupId}
              onCreate={handleCreate}
              onCancel={handleCancel}
            />
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full border border-dashed border-gray-400 rounded-lg p-3 flex items-center gap-2 text-gray-600 transition"
              style={{ backgroundColor: 'var(--card-bg)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.color = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">{t("todo.new", language)}</span>
            </button>
          )}
        </div>

        {/* Todo Items */}
        <div className="space-y-2">
          {todos
            .sort((a, b) => a.order - b.order)
            .map((todo) => (
              <TodoItemComponent
                key={`${todo.id}-${todo.title}-${todo.details}-${todo.time_nodes.length}`}
                todo={todo}
                groups={groups}
                language={language}
                onUpdate={async (id, updates) => {
                  console.log('TodoList received update:', { id, updates });
                  await onUpdateTodo(id, updates);
                  console.log('TodoList: Update complete');
                }}
                onDelete={() => onDeleteTodo(todo.id)}
              />
            ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">{t("todo.empty", language)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoList;
