import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import "./Sidebar.css";

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
  {
    type: "text",
    label: "Text",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <text
          x="16"
          y="24"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fontFamily="serif"
          fill="currentColor"
        >
          T
        </text>
      </svg>
    ),
  },
];

const presetColors = [
  { label: "Default", value: null, hex: "var(--node-bg)" },
  { label: "Red", value: "var(--color-red)", hex: "var(--color-red)" },
  { label: "Green", value: "var(--color-green)", hex: "var(--color-green)" },
  { label: "Blue", value: "var(--color-blue)", hex: "var(--color-blue)" },
  { label: "Yellow", value: "var(--color-yellow)", hex: "var(--color-yellow)" },
  { label: "Purple", value: "var(--color-purple)", hex: "var(--color-purple)" },
];

function Sidebar({ onColorChange, hasSelection, selectedNode }) {
  const [customColor, setCustomColor] = useState("#ffffff");

  useEffect(() => {
    if (
      selectedNode &&
      selectedNode.data?.fill &&
      selectedNode.data.fill.startsWith("#")
    ) {
      setCustomColor(selectedNode.data.fill);
    } else {
      setCustomColor("#ffffff");
    }
  }, [selectedNode]);

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

      <div className="sidebar-divider"></div>

      <div className="sidebar-header">
        <h2 className="sidebar-title">Fill Color</h2>
        <p className="sidebar-subtitle">Select nodes to colorize</p>
      </div>

      <div className={`color-palette ${!hasSelection ? "disabled" : ""}`}>
        {presetColors.map((color) => (
          <button
            key={color.label}
            className="color-swatch"
            style={{ background: color.hex }}
            title={color.label}
            disabled={!hasSelection}
            onClick={() => onColorChange(color.value)}
          />
        ))}
        <label
          className="color-swatch custom-color-picker"
          title="Custom color"
        >
          <Plus size={18} color="currentColor" />
          <input
            type="color"
            value={customColor}
            disabled={!hasSelection}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onColorChange(e.target.value, false);
            }}
            onBlur={(e) => {
              onColorChange(e.target.value, true);
            }}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              cursor: "pointer",
            }}
          />
        </label>
      </div>
    </aside>
  );
}

export default Sidebar;
