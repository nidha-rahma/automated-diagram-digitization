import React, { useRef } from "react";
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  Background,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { useFlowchart } from "./useFlowchart";
import { nodeTypes, defaultEdgeOptions } from "./flowConfig";
import Sidebar from "../Sidebar";
import "../../App.css";

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop,
    applyAutoLayout,
  } = useFlowchart();

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar />
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ flex: 1, height: "100%" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          connectionMode={ConnectionMode.Loose}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          defaultEdgeOptions={defaultEdgeOptions}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />

          <Panel position="bottom right">
            <button
              onClick={applyAutoLayout}
              style={{
                padding: "10px 15px",
                background: "#555",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0, 2)",
              }}
            >
              {" "}
              Auto Layout
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
