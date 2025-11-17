import { DockedEdge } from "../types";

interface DockIndicatorProps {
  edge: DockedEdge;
  onHover: () => void;
  onLeave: () => void;
}

function DockIndicator({ edge, onHover, onLeave }: DockIndicatorProps) {
  // 渐变颜色：红 -> 黄 -> 蓝 -> 绿
  const gradientColors = [
    "#FF0000", // 红（0%）
    "#FFFF00", // 黄（25%）
    "#0000FF", // 蓝（50%）
    "#00FF00", // 绿（75%）
  ];

  // 创建渐变，首尾用相同的红色实现无缝衔接
  const createGradient = () => {
    const direction = edge === "Right" ? "to bottom" : "to right";
    const colorStops = gradientColors
      .map((color, index) => {
        const position = (index * 25); // 每个颜色占25%
        return `${color} ${position}%`;
      })
      .join(", ");
    
    // 添加100%位置的红色，与0%位置完全相同
    return `linear-gradient(${direction}, ${colorStops}, #FF0000 100%)`;
  };

  // 容器样式：固定定位，填充整个窗口
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    zIndex: 9999,
    overflow: "hidden",
  };

  // 彩条包装器样式：使用 flexbox 排列两个彩条
  const stripesWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: edge === "Right" ? "column" : "row",
    width: "100%",
    height: "100%",
    animation: edge === "Right" 
      ? "rainbow-scroll-vertical 6s linear infinite" 
      : "rainbow-scroll-horizontal 6s linear infinite",
  };

  // 单个彩条样式：每个彩条占100%的长度
  const stripeStyle: React.CSSProperties = {
    flex: "0 0 100%",
    width: "100%",
    height: "100%",
    background: createGradient(),
  };

  return (
    <>
      <style>{`
        @keyframes rainbow-scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        
        @keyframes rainbow-scroll-horizontal {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        style={containerStyle}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        title="点击或悬停展开窗口"
      >
        <div style={stripesWrapperStyle}>
          {/* 彩条1 */}
          <div style={stripeStyle} />
          {/* 彩条2：完全相同，紧跟在彩条1后面 */}
          <div style={stripeStyle} />
        </div>
      </div>
    </>
  );
}

export default DockIndicator;
