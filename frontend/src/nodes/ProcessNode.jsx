import React from "react";
import { Handle, Position } from "reactflow";

export function ProcessNode({ data }) {
  return (
    // Container
    <div
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
      <div style={{ color: "black" }}>{data.label}</div>
    </div>
  );
}
