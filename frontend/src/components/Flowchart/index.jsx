import React, { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  Background,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useFlowchart } from "./useFlowchart";
import { nodeTypes, defaultEdgeOptions } from "./flowConfig";
import Sidebar from "../Sidebar";
import "../../App.css";

import { MdUndo, MdRedo } from "react-icons/md";
import { HistoryContext } from "../../hooks/HistoryContext";
import { getFlowchart, updateFlowchart } from "../../services/api";
import { saveToHistory } from "../../services/localHistory";

function FlowCanvas({ initialData, initialTitle, dbId }) {
  const reactFlowWrapper = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);

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
  } = useFlowchart(initialData);

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateFlowchart(dbId, { flow_data: { nodes, edges } });
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleSave = async () => {
    if (title === initialTitle || !title.trim()) {
      setTitle(initialTitle);
      return;
    }

    try {
      await updateFlowchart(dbId, { title: title.trim() });
      saveToHistory(dbId, title.trim());
    } catch (error) {
      console.error("Failed to save title", error);
    }
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

            <Panel position="top-left" style={{ margin: "20px" }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                }}
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  outline: "none",
                  minWidth: "100px",
                  width: `${Math.max((title || "").length, 8)}ch`,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.15s ease",
                  cursor: "text",
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#94a3b8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.borderColor = "#cbd5e1";
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(37, 99, 235, 0.15)";
                }}
                onBlur={(e) => {
                  handleTitleSave();
                  e.target.style.borderColor = "#cbd5e1";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.06)";
                }}
              />
            </Panel>

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
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "10px 16px",
                  background: isSaving ? "#475569" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSaving ? "Saving..." : "Save"}
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
  const { id } = useParams(); // Get UUID from browser URL

  const [flowData, setFlowData] = useState(null);
  const [flowTitle, setFlowTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const data = await getFlowchart(id);
        setFlowData(data.flow_data);
        setFlowTitle(data.title);

        saveToHistory(data.id, data.title);
      } catch (error) {
        console.error("Failed to fetch flowchart", error);
        alert("Flowchart not found in database!");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFromDB();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          color: "white",
        }}
      >
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <FlowCanvas
        initialData={flowData || { nodes: [], edges: [] }}
        initialTitle={flowTitle}
        dbId={id}
      />
    </ReactFlowProvider>
  );
}
