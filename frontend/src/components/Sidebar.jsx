import React from "react";
import "./Sidebar.css"; // We will create this next!

// 1. Define the shapes with actual SVG icons so users see what they are dragging
const nodeTypes = [
  {
    type: "start",
    label: "Start / End",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect
          x="2"
          y="8"
          width="28"
          height="16"
          rx="8"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    type: "process",
    label: "Process",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect
          x="4"
          y="6"
          width="24"
          height="20"
          rx="2"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    type: "decision",
    label: "Decision",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon
          points="16,2 30,16 16,30 2,16"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    type: "io",
    label: "Input / Output",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon
          points="8,8 30,8 24,24 2,24"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "all";
    event.target.classList.add("dragging");
  };

  const onDragEnd = (event) => {
    event.target.classList.remove("dragging");
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Standard Shapes</h2>
        <p className="sidebar-subtitle">Drag & drop to canvas</p>
      </div>

      <div className="sidebar-grid">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="shape-item"
            onDragStart={(event) => onDragStart(event, node.type)}
            onDragEnd={onDragEnd}
            draggable
            title={`Drag a ${node.label} node`}
          >
            <div className="shape-icon">{node.icon}</div>
            <span className="shape-label">{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
