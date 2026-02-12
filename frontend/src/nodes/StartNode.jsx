import React from "react";
import { Handle, Position } from "reactflow";

export function StartNode({ data }) {
  return (
    // Container
    <div
      style={{
        padding: "10px 20px",
        border: "1px solid #777",
        borderRadius: "50px",
        background: "white",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />

      {/* Text inside node */}
      <div style={{ color: "black" }}>{data.label}</div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
}
