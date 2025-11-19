import { useState } from "react";
import { Plus } from "lucide-react";
import { TodoItem, TodoGroup, Language, ColorTag, TimeNode } from "../types";
import { t } from "../i18n";
import TodoItemComponent from "./TodoItem";
import TodoCreator from "./TodoCreator";
import { api } from "../services/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  onTodosReordered?: () => Promise<void>;  // 待办排序后的刷新回调
  onDragStart?: () => void;  // 拖动开始回调
  onDragEnd?: () => void;    // 拖动结束回调
}

function TodoList({
  todos,
  groups,
  language,
  currentGroupId,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onTodosReordered,
  onDragStart,
  onDragEnd,
}: TodoListProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  // dnd-kit sensors配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才激活拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // 按order排序获取待办列表
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order);

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

  // dnd-kit拖拽开始处理
  const handleDragStart = () => {
    if (onDragStart) {
      onDragStart();
    }
  };

  // dnd-kit拖拽结束处理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // 如果没有有效的拖动目标，立即通知结束
    if (!over || active.id === over.id) {
      if (onDragEnd) {
        onDragEnd();
      }
      return;
    }

    const oldIndex = sortedTodos.findIndex((todo) => todo.id === active.id);
    const newIndex = sortedTodos.findIndex((todo) => todo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error('Invalid drag operation');
      if (onDragEnd) {
        onDragEnd();
      }
      return;
    }

    // 使用dnd-kit的arrayMove重新排序
    const reorderedTodos = arrayMove(sortedTodos, oldIndex, newIndex);
    const newOrderIds = reorderedTodos.map((todo) => todo.id);
    
    console.log('Reordered:', { oldIndex, newIndex, newOrderIds });

    try {
      // 调用API保存新顺序
      await api.reorderTodos(newOrderIds);
      // 调用回调刷新数据（保持所有状态不变，包括isPinned）
      if (onTodosReordered) {
        await onTodosReordered();
      }
      console.log('待办排序成功，数据已刷新');
    } catch (error) {
      console.error('Failed to reorder todos:', error);
    } finally {
      // 无论成功失败都要通知拖动结束
      if (onDragEnd) {
        onDragEnd();
      }
    }
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

        {/* Todo Items with dnd-kit */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTodos.map((todo) => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedTodos.map((todo) => (
                <TodoItemComponent
                  key={todo.id}
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
          </SortableContext>
        </DndContext>

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
