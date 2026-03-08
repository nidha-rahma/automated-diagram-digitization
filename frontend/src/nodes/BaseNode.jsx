import React from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { useEditableNode } from "../hooks/useEditableNodes";

export function BaseNode({
  id,
  data,
  selected,
  children,
  minW = 80,
  minH = 40,
}) {
  const { isEditing, label, onDoubleClick, onBlur, onKeyDown, onChange } =
    useEditableNode(data.label);

  return (
    // Container
    <div
      onDoubleClick={onDoubleClick}
      style={{
        position: "relative",
        padding: "10px 20px",
        minWidth: `${minW}px`,
        minHeight: `${minH}px`,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NodeResizer
        nodeId={id}
        color="#555"
        isVisible={selected}
        minWidth={minW}
        minHeight={minH}
      />

      {children}

      {/*Handles (one of each corner) */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />

      {/* Text inside node */}
      <div style={{ width: "100%", zIndex: 1 }}>
        {isEditing ? (
          <input
            value={label}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
            className="nodrag"
            size={Math.max(label.length, 1)}
            style={{
              color: "var(--node-text)",
              border: "none",
              textAlign: "center",
              outline: "none",
              background: "transparent",
              width: "100%",
            }}
          />
        ) : (
          <div style={{ color: "var(--node-text)", textAlign: "center" }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
