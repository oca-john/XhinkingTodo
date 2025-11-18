import { useState } from "react";
import { Plus } from "lucide-react";
import { TodoItem, TodoGroup, Language, ColorTag, TimeNode } from "../types";
import { t } from "../i18n";
import TodoItemComponent from "./TodoItem";
import TodoCreator from "./TodoCreator";
import { api } from "../services/api";

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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  // 拖拽处理函数
  const handleDragStart = (todoId: string) => {
    console.log('Drag start:', todoId);
    setDraggedId(todoId);
  };

  const handleDragOver = (e: React.DragEvent, todoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && draggedId !== todoId) {
      setDragOverId(todoId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop:', { draggedId, targetId });
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // 按order排序获取当前顺序
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    // 找到拖动的todo和目标位置的索引
    const draggedIndex = sortedTodos.findIndex(t => t.id === draggedId);
    const targetIndex = sortedTodos.findIndex(t => t.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      console.error('Invalid drag operation');
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // 移动元素
    const [draggedTodo] = sortedTodos.splice(draggedIndex, 1);
    sortedTodos.splice(targetIndex, 0, draggedTodo);

    // 获取新的ID顺序
    const newOrderIds = sortedTodos.map(todo => todo.id);
    console.log('New order:', newOrderIds);

    try {
      // 调用API保存新顺序
      await api.reorderTodos(newOrderIds);
      // 刷新数据
      window.location.reload();
    } catch (error) {
      console.error("Failed to reorder todos:", error);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    console.log('Drag end');
    setDraggedId(null);
    setDragOverId(null);
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
                key={todo.id}
                todo={todo}
                groups={groups}
                language={language}
                isDragging={draggedId === todo.id}
                isDragOver={dragOverId === todo.id}
                onDragStart={() => handleDragStart(todo.id)}
                onDragOver={(e: React.DragEvent) => handleDragOver(e, todo.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e: React.DragEvent) => handleDrop(e, todo.id)}
                onDragEnd={handleDragEnd}
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
