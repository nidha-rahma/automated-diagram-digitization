import React, { useRef } from "react";
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  Background,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useLocation } from "react-router-dom";

import { useFlowchart } from "./useFlowchart";
import { nodeTypes, defaultEdgeOptions } from "./flowConfig";
import Sidebar from "../Sidebar";
import "../../App.css";

import { MdUndo, MdRedo } from "react-icons/md";
import { HistoryContext } from "../../hooks/HistoryContext";

function FlowCanvas() {
  const location = useLocation();

  // Extract data passed from input page
  const initialFlowData = location.state?.flowData || { nodes: [], edges: [] };
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
    undo,
    redo,
    past,
    future,
    takeSnapShot,
  } = useFlowchart(initialFlowData);

  const circleButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid #ddd",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    color: "#333",
    fontSize: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar />
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ flex: 1, height: "100%" }}
      >
        <HistoryContext.Provider value={{ takeSnapShot }}>
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
            onNodeDragStart={takeSnapShot}
            onNodesDelete={takeSnapShot}
            onEdgesDelete={takeSnapShot}
            defaultEdgeOptions={defaultEdgeOptions}
            snapToGrid={true}
            snapGrid={[15, 15]}
            fitView
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />

            <Panel
              position="top right"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                onClick={undo}
                disabled={past.length === 0}
                title="Undo"
                style={{
                  ...circleButtonStyle,
                  cursor: past.length === 0 ? "not-allowed" : "pointer",
                  opacity: past.length === 0 ? 0.5 : 1,
                }}
              >
                <MdUndo size={22} color="black" />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                title="Redo"
                style={{
                  ...circleButtonStyle,
                  cursor: future.length === 0 ? "not-allowed" : "pointer",
                  opacity: future.length === 0 ? 0.5 : 1,
                }}
              >
                <MdRedo size={22} color="black" />
              </button>
            </Panel>

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
        </HistoryContext.Provider>
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
