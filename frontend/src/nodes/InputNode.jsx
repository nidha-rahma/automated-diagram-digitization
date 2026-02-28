import React from "react";
import { Handle, NodeResizer, Position } from "reactflow";
import { useEditableNode } from "../hooks/useEditableNodes";

export function InputNode({ id, data, selected }) {
  const { isEditing, label, onDoubleClick, onBlur, onKeyDown, onChange } =
    useEditableNode(data.label);

  return (
    // Container
    <div
      onDoubleClick={onDoubleClick}
      style={{
        position: "relative",
        minWidth: "80px",
        minHeight: "40px",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 20px",
      }}
    >
      <NodeResizer
        nodeId={id}
        color="#555"
        isVisible={selected}
        minWidth={80}
        minHeight={40}
      />

      <div
        onDoubleClick={onDoubleClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "white",
          border: "1px solid #777",
          borderRadius: "2px",
          transform: "skewX(-20deg)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/*Handles (one of each corner) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        style={{ background: "#555" }}
      />

      {/* Text inside node */}
      <div>
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
              color: "black",
              border: "none",
              textAlign: "center",
              outline: "none",
              background: "transparent",
              width: "100%",
            }}
          />
        ) : (
          <div style={{ color: "black" }}>{label}</div>
        )}
      </div>
    </div>
  );
}
