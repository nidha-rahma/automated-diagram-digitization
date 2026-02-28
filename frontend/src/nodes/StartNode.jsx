import React from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { useEditableNode } from "../hooks/useEditableNodes";

export function StartNode({ id, data, selected }) {
  const { isEditing, label, onDoubleClick, onBlur, onKeyDown, onChange } =
    useEditableNode(data.label);

  return (
    // Container
    <div
      onDoubleClick={onDoubleClick}
      style={{
        padding: "10px 20px",
        border: "1px solid #777",
        borderRadius: "50px",
        background: "white",
        minWidth: "80px",
        minHeight: "40px",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <NodeResizer
        nodeId={id}
        color="#555"
        isVisible={selected}
        minWidth={80}
        minHeight={40}
      />

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
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

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}
