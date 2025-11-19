import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, Trash2 } from "lucide-react";
import { TodoGroup } from "../types";

interface SortableGroupItemProps {
  group: TodoGroup;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  collapsed?: boolean;  // 导航栏是否折叠
}

function SortableGroupItem({
  group,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  collapsed = false,
}: SortableGroupItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: group.id,
    disabled: group.is_default, // 禁用默认分组的拖动
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或其子元素，不触发选择
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onSelect();
  };

  return (
    <div
      ref={setNodeRef}
      {...(group.is_default ? {} : attributes)}
      {...(group.is_default ? {} : listeners)}
      onClick={handleClick}
      style={{
        ...style,
        cursor: group.is_default ? 'pointer' : (isDragging ? 'grabbing' : 'grab'),
      }}
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors group ${
        isSelected
          ? "bg-blue-100"
          : "hover:bg-gray-100"
      }`}
    >
      <div className={`flex items-center gap-2 flex-1 min-w-0 ${
        collapsed ? "justify-center" : ""
      }`}>
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" 
          style={{ backgroundColor: 'var(--button-bg)', color: 'var(--accent-color)' }}
          title={collapsed ? group.name : ""}
        >
          {group.name.charAt(0).toUpperCase()}
        </div>
        {!collapsed && <span className="text-sm truncate">{group.name}</span>}
      </div>
      {!collapsed && !group.is_default && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-200 rounded"
            title="编辑分组"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 rounded text-red-500"
            title="删除分组"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SortableGroupItem;
