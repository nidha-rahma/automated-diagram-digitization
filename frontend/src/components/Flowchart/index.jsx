import React, { useRef } from "react";
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  Background,
  ConnectionMode,
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
    onNodesDelete, 
    onEdgesDelete,
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
          onNodesDelete={onNodesDelete} 
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          defaultEdgeOptions={defaultEdgeOptions}
          // PRO SETTINGS
          deleteKeyCode={["Backspace", "Delete"]} // Support both Mac and Windows keys
          selectionKeyCode={["Shift"]}            // Hold Shift to select multiple items
          multiSelectionKeyCode={["Shift"]}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
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
