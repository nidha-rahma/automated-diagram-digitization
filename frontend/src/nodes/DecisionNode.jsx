import React from "react";
import { Handle, Position } from "reactflow";
import { useEditableNode } from "../hooks/useEditableNodes";

export function DecisionNode({ data }) {
  const { isEditing, label, onDoubleClick, onBlur, onKeyDown, onChange } =
    useEditableNode(data.label);

  return (
    // Container
    <div
      onDoubleClick={onDoubleClick}
      style={{
        width: "120px",
        height: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Shape (actual diamond) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "white",
          border: "1px solid #777",
          // Clip the sqaure into a diamond
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          zIndex: -1,
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
        <div
          style={{
            color: "black",
            padding: "10px",
            fontSize: "12px",
            textAlign: "center",
            maxWidth: "70px",
            lineHeight: "1.2",
          }}
        >
          {data.label}
        </div>
      )}
    </div>
  );
}
