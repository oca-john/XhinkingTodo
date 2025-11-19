import { useEffect, useState, useRef, useCallback } from "react";
import { AppData, Theme, AppSettings, DockedEdge, ColorTag, TimeNode } from "./types";
import { api } from "./services/api";
import Sidebar from "./components/Sidebar";
import TodoList from "./components/TodoList";
import Header from "./components/Header";
import SettingsPanel from "./components/SettingsPanel";
import AboutPanel from "./components/AboutPanel";
import DockIndicator from "./components/DockIndicator";
import { APP_VERSION, APP_NAME, APP_AUTHOR } from "./version";

function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"all" | "group" | "settings" | "about">("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // 默认折叠
  const [dockedEdge, setDockedEdge] = useState<DockedEdge>(DockedEdge.Right); // 默认右侧停靠
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // 导航栏折叠状态
  const [expandedPosition, setExpandedPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingTodo, setIsDraggingTodo] = useState(false); // 拖动待办条目状态
  const collapseTimeoutRef = useRef<number | null>(null);
  const rightEdgeRef = useRef<number | null>(null); // 记录右边缘位置
  const isAdjustingRef = useRef<boolean>(false);

  // 使用useCallback包装handleUpdateSettings，避免依赖问题
  const handleUpdateSettings = useCallback(async (settings: AppSettings) => {
    if (!appData) return;
    try {
      await api.updateSettings(settings);
      setAppData({
        ...appData,
        settings,
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }, [appData]);

  useEffect(() => {
    loadData();
  }, []);

  // 在数据加载完成后初始化窗口停靠
  useEffect(() => {
    if (appData && !expandedPosition) {
      initializeDocking();
    }
  }, [appData]);

  // 初始化右边缘位置
  useEffect(() => {
    if (expandedPosition && rightEdgeRef.current === null) {
      rightEdgeRef.current = expandedPosition.x + expandedPosition.width;
      console.log('初始化右边缘位置:', rightEdgeRef.current);
    }
  }, [expandedPosition]);

  // 监听窗口大小变化，在会话中记住用户调整
  useEffect(() => {
    let resizeTimeout: number | null = null;
    
    const handleResize = async () => {
      // 只在窗口展开时更新位置
      if (!isCollapsed && !isPinned && !isAdjustingRef.current) {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        resizeTimeout = window.setTimeout(async () => {
          try {
            const currentPos = await api.getWindowPosition();
            
            // 如果停靠在上边缘，保持右边缘位置固定
            if (dockedEdge === DockedEdge.Top && rightEdgeRef.current !== null) {
              const currentRightEdge = currentPos.x + currentPos.width;
              const rightEdgeDelta = currentRightEdge - rightEdgeRef.current;
              
              // 如果右边缘位置变化了，需要调整x坐标
              if (Math.abs(rightEdgeDelta) > 1) { // 允许1px误差
                isAdjustingRef.current = true;
                
                // 根据固定的右边缘位置计算新的x坐标
                const newX = rightEdgeRef.current - currentPos.width;
                await api.expandFromEdge(newX, currentPos.y, currentPos.width, currentPos.height);
                currentPos.x = newX;
                console.log(`上边缘停靠：右边缘保持在${rightEdgeRef.current}，x调整为${newX}`);
                
                setTimeout(() => {
                  isAdjustingRef.current = false;
                }, 100);
              } else {
                // 右边缘位置没有明显变化，更新参考位置
                rightEdgeRef.current = currentRightEdge;
              }
            }
            
            const newPosition = {
              x: currentPos.x,
              y: currentPos.y,
              width: currentPos.width,
              height: currentPos.height,
            };
            setExpandedPosition(newPosition);
            
            // 如果开启了记住窗口大小，保存到设置中
            if (appData && appData.settings.remember_window_size) {
              await handleUpdateSettings({
                ...appData.settings,
                window_position: currentPos,
              });
              console.log('✅ 窗口大小已保存:', currentPos);
            } else {
              console.log('窗口尺寸已更新（仅当前会话）:', currentPos);
            }
          } catch (error) {
            console.error('Failed to update window position:', error);
          }
        }, 500); // 防抖动，500ms后更新
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [isCollapsed, isPinned, appData, handleUpdateSettings, dockedEdge]); // 移除expandedPosition依赖，避免循环

  // 初始化停靠：默认停靠在右侧
  const initializeDocking = async () => {
    try {
      const [monitorX, monitorY, monitorWidth, monitorHeight] = await api.getMonitorInfo();
      const currentPos = await api.getWindowPosition();
      
      let defaultX, defaultY, defaultWidth, defaultHeight;
      
      // 如果开启了记住窗口大小且有保存的位置，使用保存的值
      if (appData && appData.settings.remember_window_size && appData.settings.window_position) {
        const saved = appData.settings.window_position;
        // 验证保存的值是否有效
        if (saved.x && saved.y && saved.width && saved.height) {
          defaultX = saved.x;
          defaultY = saved.y;
          defaultWidth = saved.width;
          defaultHeight = saved.height;
          console.log('✅ 使用保存的窗口大小:', saved);
        } else {
          console.warn('⚠️ 保存的窗口位置数据无效，使用默认值');
          // 使用默认值
          const rightMargin = monitorWidth / 80;
          const topMargin = monitorHeight / 45;
          const margin = Math.min(rightMargin, topMargin);
          defaultHeight = Math.floor(monitorHeight * 2 / 3);
          defaultWidth = currentPos.width;
          defaultX = monitorX + monitorWidth - defaultWidth - margin;
          defaultY = monitorY + margin;
        }
      } else {
        console.log('📄 未开启记住窗口大小或无保存数据，使用默认值');
        // 计算窗口展开时的默认位置
        // 分别计算距离右侧和上边的距离，取较小值以适配不同比例显示器
        const rightMargin = monitorWidth / 80;    // 右侧边距
        const topMargin = monitorHeight / 45;     // 上侧边距
        const margin = Math.min(rightMargin, topMargin);  // 取较小值，确保在不同比例屏幕上都合适
        
        // 窗口默认高度为屏幕高度的三分之二
        defaultHeight = Math.floor(monitorHeight * 2 / 3);
        defaultWidth = currentPos.width;
        defaultX = monitorX + monitorWidth - defaultWidth - margin;
        defaultY = monitorY + margin;
      }
      
      // 保存展开状态的位置和尺寸
      const position = {
        x: Math.floor(defaultX),
        y: Math.floor(defaultY),
        width: Math.floor(defaultWidth),
        height: Math.floor(defaultHeight),
      };
      setExpandedPosition(position);
      
      // 初始化右边缘位置
      rightEdgeRef.current = position.x + position.width;
      console.log('窗口初始化，右边缘位置:', rightEdgeRef.current);
      
      // 默认停靠到右侧，折叠状态（使用正确的窗口尺寸）
      await api.collapseToEdge(
        dockedEdge,
        Math.floor(defaultY),
        Math.floor(defaultHeight),
        Math.floor(defaultX),
        Math.floor(defaultWidth)
      );
      setIsCollapsed(true);
    } catch (error) {
      console.error("Failed to initialize docking:", error);
    }
  };

  const loadData = async () => {
    try {
      const data = await api.getAllData();
      setAppData(data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (data: {
    title: string;
    details: string | null;
    groupId: string;
    colorTag: ColorTag;
    timeNodes: Omit<TimeNode, "id" | "created_at">[];
  }) => {
    if (!appData) return;
    try {
      // 创建待办
      let newTodo = await api.createTodo(data.title, data.details, data.groupId, data.colorTag);
      
      // 添加时间节点
      for (const timeNode of data.timeNodes) {
        await api.addTimeNode(
          newTodo.id,
          timeNode.date_time,
          timeNode.description || null,
          timeNode.reminder_enabled,
          timeNode.reminder_minutes_before
        );
      }
      
      // 重新获取待办，以获取添加的时间节点
      if (data.timeNodes.length > 0) {
        const refreshedData = await api.getAllData();
        const refreshedTodo = refreshedData.todos.find(t => t.id === newTodo.id);
        if (refreshedTodo) {
          newTodo = refreshedTodo;
        }
      }
      
      setAppData({
        ...appData,
        todos: [...appData.todos, newTodo],
      });
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleUpdateTodo = async (id: string, updates: {
    title?: string;
    details?: string | null;
    groupId?: string;
    colorTag?: ColorTag;
    timeNodes?: TimeNode[];
    completed?: boolean;
  }) => {
    if (!appData) return;
    try {
      console.log('=== handleUpdateTodo START ===');
      console.log('Todo ID:', id);
      console.log('Updates:', updates);
      
      const currentTodo = appData.todos.find(t => t.id === id);
      if (!currentTodo) {
        console.error('Todo not found:', id);
        return;
      }
      
      // 第1步：更新基本字段
      console.log('Step 1: Updating basic fields...');
      await api.updateTodo(id, {
        title: updates.title,
        details: updates.details !== undefined ? updates.details || undefined : undefined,
        groupId: updates.groupId,
        colorTag: updates.colorTag,
        completed: updates.completed,
      });
      console.log('Basic fields updated successfully');
      
      // 如果只是更新completed状态，跳过时间节点处理
      if (!updates.timeNodes) {
        console.log('No time nodes to update, refreshing data...');
        const refreshedData = await api.getAllData();
        setAppData(refreshedData);
        console.log('=== handleUpdateTodo COMPLETE (simple update) ===');
        return;
      }
      
      // 第2步：处理时间节点删除
      console.log('Step 2: Processing time node deletions...');
      const currentNodeIds = new Set(currentTodo.time_nodes.map(n => n.id));
      const newNodeMap = new Map(updates.timeNodes.map(n => [n.id, n]));
      
      for (const node of currentTodo.time_nodes) {
        if (!newNodeMap.has(node.id)) {
          console.log('  Deleting node:', node.id);
          await api.deleteTimeNode(node.id);
        }
      }
      
      // 第3步：处理时间节点更新
      console.log('Step 3: Processing time node updates...');
      for (const node of updates.timeNodes) {
        if (!node.id.startsWith('temp-') && currentNodeIds.has(node.id)) {
          console.log('  Updating node:', node.id);
          await api.updateTimeNode(
            node.id,
            node.date_time,
            node.description || null,
            node.reminder_enabled,
            node.reminder_minutes_before
          );
        }
      }
      
      // 第4步：处理新增时间节点
      console.log('Step 4: Processing new time nodes...');
      for (const node of updates.timeNodes) {
        if (node.id.startsWith('temp-')) {
          console.log('  Adding new node:', node);
          await api.addTimeNode(
            id,
            node.date_time,
            node.description || null,
            node.reminder_enabled,
            node.reminder_minutes_before
          );
        }
      }
      
      // 第5步：重新获取完整数据
      console.log('Step 5: Refreshing all data...');
      const refreshedData = await api.getAllData();
      const refreshedTodo = refreshedData.todos.find(t => t.id === id);
      
      if (!refreshedTodo) {
        console.error('Todo not found after refresh:', id);
        return;
      }
      
      console.log('Refreshed todo:', refreshedTodo);
      
      // 采用删除-重建策略：先从状态中移除旧项，再添加新项
      // 这样强制React完全重新渲染组件，避免状态缓存问题
      console.log('Step 6: Removing old todo from state...');
      const todosWithoutOld = refreshedData.todos.filter(t => t.id !== id);
      
      console.log('Step 7: Re-adding updated todo...');
      const reorderedTodos = [...todosWithoutOld];
      // 找到原来的位置，插入更新后的todo
      const originalIndex = appData.todos.findIndex(t => t.id === id);
      if (originalIndex !== -1) {
        reorderedTodos.splice(originalIndex, 0, refreshedTodo);
      } else {
        reorderedTodos.push(refreshedTodo);
      }
      
      console.log('Step 8: Setting new state with rebuilt todo list...');
      setAppData({
        ...refreshedData,
        todos: reorderedTodos
      });
      
      console.log('=== handleUpdateTodo COMPLETE ===');
    } catch (error) {
      console.error('=== handleUpdateTodo ERROR ===');
      console.error(error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!appData) return;
    try {
      await api.deleteTodo(id);
      setAppData({
        ...appData,
        todos: appData.todos.filter((t) => t.id !== id),
      });
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const handleCreateGroup = async (name: string) => {
    if (!appData) return;
    try {
      const newGroup = await api.createGroup(name);
      setAppData({
        ...appData,
        groups: [...appData.groups, newGroup],
      });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    if (!appData) return;
    try {
      const updatedGroup = await api.updateGroup(id, name);
      setAppData({
        ...appData,
        groups: appData.groups.map((g) => (g.id === id ? updatedGroup : g)),
      });
    } catch (error) {
      console.error("Failed to update group:", error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!appData) return;
    try {
      // moveToPersonal=true 表示将该分组的待办移动到 personal 分组
      await api.deleteGroup(id, true);
      setAppData({
        ...appData,
        groups: appData.groups.filter((g) => g.id !== id),
        // 同时更新待办列表，将删除分组的待办移到 personal
        todos: appData.todos.map((t) =>
          t.group_id === id ? { ...t, group_id: "personal" } : t
        ),
      });
      // 如果当前选中的分组被删除，切换到“所有”视图
      if (selectedGroupId === id) {
        setSelectedView("all");
        setSelectedGroupId(null);
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedView("group");
    setSelectedGroupId(groupId);
  };


  // 处理指示器悬停 - 展开窗口
  const handleIndicatorHover = async () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    
    // 只在未钉住且折叠时展开
    if (!isPinned && isCollapsed && expandedPosition) {
      try {
        await api.expandFromEdge(
          expandedPosition.x,
          expandedPosition.y,
          expandedPosition.width,
          expandedPosition.height
        );
        setIsCollapsed(false);
      } catch (error) {
        console.error("Failed to expand window:", error);
      }
    }
  };

  // 处理指示器离开 - 延迟折叠窗口
  const handleIndicatorLeave = () => {
    // 【钉住权限最高】钉住时不折叠
    if (isPinned) {
      console.log('窗口已钉住，忽略指示器离开事件');
      return;
    }
    
    // 延迟500毫秒后折叠
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    
    collapseTimeoutRef.current = window.setTimeout(async () => {
      // 【钉住权限最高】双重检查isPinned状态
      if (isPinned) {
        console.log('窗口已钉住，取消延迟折叠');
        return;
      }
      
      if (!isCollapsed && expandedPosition) {
        try {
          await api.collapseToEdge(
            dockedEdge,
            expandedPosition.y,
            expandedPosition.height,
            expandedPosition.x,
            expandedPosition.width
          );
          setIsCollapsed(true);
        } catch (error) {
          console.error("Failed to collapse window:", error);
        }
      }
    }, 500);
  };

  // 处理窗口鼠标进入 - 取消折叠定时器
  const handleWindowMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    // 鼠标重新进入窗口时，如果正在拖动，保持拖动状态
    // 不重置isDraggingTodo，让拖动正常结束
  };

  // 处理窗口鼠标离开 - 延迟折叠窗口（使用鼠标位置检测）
  const handleWindowMouseLeave = () => {
    // 【钉住权限最高】钉住、已折叠或拖动中时不处理
    if (isPinned || isCollapsed || isDraggingTodo) {
      if (isPinned) console.log('窗口已钉住，忽略鼠标离开事件');
      return;
    }

    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    
    // 延迟500毫秒后检查鼠标位置再决定是否折叠
    collapseTimeoutRef.current = window.setTimeout(async () => {
      // 【钉住权限最高】双重检查isPinned状态
      if (isPinned) {
        console.log('窗口已钉住，取消延迟折叠');
        return;
      }
      
      if (!isCollapsed && expandedPosition) {
        try {
          // 检查鼠标是否仍在窗口内
          const mouseInWindow = await api.isMouseInWindow();
          if (!mouseInWindow) {
            // 鼠标确实离开了窗口，执行折叠
            await api.collapseToEdge(
              dockedEdge,
              expandedPosition.y,
              expandedPosition.height,
              expandedPosition.x,
              expandedPosition.width
            );
            setIsCollapsed(true);
          }
        } catch (error) {
          console.error("Failed to collapse window:", error);
        }
      }
    }, 500);
  };

  // 处理钉住按钮切换
  const handlePinToggle = async () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    
    if (newPinnedState) {
      // 钉住：取消折叠定时器并展开窗口
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
      if (isCollapsed && expandedPosition) {
        try {
          await api.expandFromEdge(
            expandedPosition.x,
            expandedPosition.y,
            expandedPosition.width,
            expandedPosition.height
          );
          setIsCollapsed(false);
        } catch (error) {
          console.error("Failed to expand window:", error);
        }
      }
    } else {
      // 取消钉住：检查鼠标位置，如果不在窗口上则延迟折叠
      setTimeout(async () => {
        const mouseInWindow = await api.isMouseInWindow();
        if (!mouseInWindow) {
          handleWindowMouseLeave();
        }
      }, 100);
    }
  };

  // 处理切换停靠位置
  const handleToggleDockEdge = async () => {
    const newEdge = dockedEdge === DockedEdge.Right ? DockedEdge.Top : DockedEdge.Right;
    setDockedEdge(newEdge);
    
    // 【钉住权限最高】如果窗口已钉住，只切换停靠边，不折叠窗口
    if (isPinned) {
      console.log('窗口已钉住，只切换停靠边，不折叠');
      return;
    }
    
    // 如果当前是折叠状态，需要先展开，再重新停靠
    if (isCollapsed && expandedPosition) {
      try {
        // 先展开窗口
        await api.expandFromEdge(
          expandedPosition.x,
          expandedPosition.y,
          expandedPosition.width,
          expandedPosition.height
        );
        setIsCollapsed(false);
        
        // 稍后重新折叠到新位置（再次检查isPinned）
        setTimeout(async () => {
          // 【二次确认钉住状态】防止在延迟期间窗口被钉住
          if (isPinned) {
            console.log('延迟期间窗口被钉住，取消折叠');
            return;
          }
          
          try {
            const [monitorX, monitorY, monitorWidth, monitorHeight] = await api.getMonitorInfo();
            const centerY = monitorY + (monitorHeight - expandedPosition.height) / 2;
            const centerX = monitorX + (monitorWidth - expandedPosition.width) / 2;
            await api.collapseToEdge(
              newEdge,
              Math.floor(centerY),
              Math.floor(expandedPosition.height),
              Math.floor(centerX),
              Math.floor(expandedPosition.width)
            );
            setIsCollapsed(true);
          } catch (error) {
            console.error("Failed to collapse to new edge:", error);
          }
        }, 100);
      } catch (error) {
        console.error("Failed to toggle dock edge:", error);
      }
    }
  };

  // 处理退出应用
  const handleExit = () => {
    if (window.confirm("确定要退出应用吗？")) {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-milk-white">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="flex items-center justify-center h-screen bg-milk-white">
        <div className="text-xl text-red-500">加载失败</div>
      </div>
    );
  }

  const getThemeClass = (theme: Theme): string => {
    const themeMap: Record<Theme, string> = {
      [Theme.White]: "theme-white",
      [Theme.MilkWhite]: "theme-milk-white",
      [Theme.LightRed]: "theme-light-red",
      [Theme.LightYellow]: "theme-light-yellow",
      [Theme.LightGreen]: "theme-light-green",
      [Theme.LightBlue]: "theme-light-blue",
      [Theme.LightPurple]: "theme-light-purple",
      [Theme.DarkRed]: "theme-dark-red",
      [Theme.DarkYellow]: "theme-dark-yellow",
      [Theme.DarkGreen]: "theme-dark-green",
      [Theme.DarkBlue]: "theme-dark-blue",
      [Theme.DarkPurple]: "theme-dark-purple",
      [Theme.DarkGray]: "theme-dark-gray",
      [Theme.Black]: "theme-black",
    };
    return themeMap[theme] || themeMap[Theme.White];
  };

  const filteredTodos = appData.todos.filter((todo) => {
    // 根据视图筛选
    if (selectedView === "group" && selectedGroupId) {
      if (todo.group_id !== selectedGroupId) return false;
    }
    
    // 根据设置筛选已完成项
    if (appData.settings.hide_completed && todo.completed) return false;
    
    // 筛选归档和隐藏项
    if (todo.archived || todo.hidden) return false;
    
    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        todo.title.toLowerCase().includes(query) ||
        (todo.details && todo.details.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <div 
      className={`flex flex-col h-screen ${getThemeClass(appData.settings.theme)} relative`}
      onMouseEnter={handleWindowMouseEnter}
      onMouseLeave={handleWindowMouseLeave}
    >
      {/* 动态彩色渐变指示器 - 只在窗口折叠时显示 */}
      {isCollapsed && (
        <DockIndicator
          edge={dockedEdge}
          onHover={handleIndicatorHover}
          onLeave={handleIndicatorLeave}
        />
      )}
      
      {/* 主窗口内容 - 在折叠时不显示 */}
      {!isCollapsed && (
        <>
          <Header
            language={appData.settings.language}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isPinned={isPinned}
            onPinToggle={handlePinToggle}
            onToggleDockEdge={handleToggleDockEdge}
            onExit={handleExit}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              groups={appData.groups}
              language={appData.settings.language}
              selectedView={selectedView}
              selectedGroupId={selectedGroupId}
              onSelectAll={() => setSelectedView("all")}
              onSelectGroup={handleSelectGroup}
              onSelectSettings={() => setSelectedView("settings")}
              onSelectAbout={() => setSelectedView("about")}
              onCreateGroup={handleCreateGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              onCollapseChange={setSidebarCollapsed}
              onGroupsReordered={loadData}
            />
            <div className="flex-1 overflow-auto">
              {selectedView === "settings" ? (
                <SettingsPanel
                  settings={appData.settings}
                  onUpdateSettings={handleUpdateSettings}
                  sidebarCollapsed={sidebarCollapsed}
                />
              ) : selectedView === "about" ? (
                <AboutPanel language={appData.settings.language} />
              ) : (
                <TodoList
                  todos={filteredTodos}
                  groups={appData.groups}
                  language={appData.settings.language}
                  currentGroupId={selectedView === "group" && selectedGroupId ? selectedGroupId : undefined}
                  onCreateTodo={handleCreateTodo}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onTodosReordered={loadData}
                  onDragStart={() => setIsDraggingTodo(true)}
                  onDragEnd={async () => {
                    // 拖动结束后，根据情况决定是否重置状态
                    if (isPinned) {
                      // 钉住状态，立即重置（不会折叠）
                      setIsDraggingTodo(false);
                    } else {
                      // 未钉住，检查鼠标是否在窗口内
                      try {
                        const mouseInWindow = await api.isMouseInWindow();
                        if (mouseInWindow) {
                          // 鼠标在窗口内，立即重置
                          setIsDraggingTodo(false);
                        } else {
                          // 鼠标已离开，延迟300ms重置，给用户时间移回鼠标
                          setTimeout(() => {
                            setIsDraggingTodo(false);
                          }, 300);
                        }
                      } catch (error) {
                        console.error('Failed to check mouse position:', error);
                        // 出错时保守处理，立即重置
                        setIsDraggingTodo(false);
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
          {/* 底部信息栏 */}
          <div className="flex items-center justify-between px-3 border-t" style={{ height: '16px', fontSize: '10px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
            <div>{APP_NAME} {APP_VERSION}</div>
            <div>Made with ♥️ by {APP_AUTHOR}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
