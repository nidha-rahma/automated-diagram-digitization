import React from "react";
import { Handle, Position } from "reactflow";
import { useEditableNode } from "../hooks/useEditableNodes";

export function ProcessNode({ data }) {
  const { isEditing, label, onDoubleClick, onBlur, onKeyDown, onChange } =
    useEditableNode(data.label);

  return (
    // Container
    <div
      onDoubleClick={onDoubleClick}
      style={{
        padding: "10px 20px",
        border: "1px solid #777",
        borderRadius: "2px",
        background: "white",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
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
          }}
        />
      ) : (
        <div style={{ color: "black" }}>{label}</div>
      )}
    </div>
  );
}
