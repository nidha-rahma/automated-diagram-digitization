import React, { useEffect, useRef, useState, useCallback } from "react";
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

import { MdUndo, MdRedo, MdDarkMode, MdLightMode } from "react-icons/md";
import { HistoryContext } from "../../hooks/HistoryContext";
import { getFlowchart, updateFlowchart } from "../../services/api";
import { saveToHistory } from "../../services/localHistory";

function FlowCanvas({ initialData, initialTitle, dbId }) {
  const reactFlowWrapper = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("clickflow_theme");
    return savedTheme ? savedTheme === "dark" : true; // Default to dark mode
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("clickflow_theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

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
    onNodesDelete,
    onEdgesDelete,
  } = useFlowchart(initialData);

  const circleButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    fontSize: "20px",
    transition: "all 0.2s ease",
  };

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await updateFlowchart(dbId, { flow_data: { nodes, edges } });
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }, [dbId, nodes, edges]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (cmdOrCtrl && event.key.toLowerCase() === "s") {
        event.preventDefault();

        if (!isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, isSaving]);

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
    <div
      className={isDarkMode ? "dark-theme" : "light-theme"}
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
      }}
    >
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
            deleteKeyCode={["Backspace", "Delete"]}
            selectionKeyCode={["Shift"]}
            multiSelectionKeyCode={["Shift"]}
            onNodesDelete={onNodesDelete || takeSnapShot}
            onEdgesDelete={onEdgesDelete || takeSnapShot}
            defaultEdgeOptions={defaultEdgeOptions}
            snapToGrid={true}
            snapGrid={[15, 15]}
            fitView
          >
            <Background
              variant="dots"
              gap={12}
              size={2}
              color={isDarkMode ? "#4f5052" : "#cbd5e1"}
              style={{ backgroundColor: isDarkMode ? "#171e29" : "#f8fafc" }}
            />
            <Controls
              style={{
                button: {
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  fill: "white",
                },
              }}
            />

            <Panel position="top-left" style={{ margin: "20px" }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                }}
                className="editor-title-input"
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
                onClick={toggleTheme}
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                className="editor-panel-btn"
                style={{ ...circleButtonStyle }}
              >
                {isDarkMode ? (
                  <MdLightMode size={20} color="#f8fafc" />
                ) : (
                  <MdDarkMode size={20} color="#334155" />
                )}
              </button>
              <button
                onClick={undo}
                disabled={past.length === 0}
                title="Undo"
                className="editor-panel-btn"
                style={{
                  ...circleButtonStyle,
                  cursor: past.length === 0 ? "not-allowed" : "pointer",
                  opacity: past.length === 0 ? 0.5 : 1,
                }}
              >
                <MdUndo size={22} color={isDarkMode ? "#f8fafc" : "#334155"} />
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                title="Redo"
                className="editor-panel-btn"
                style={{
                  ...circleButtonStyle,
                  cursor: future.length === 0 ? "not-allowed" : "pointer",
                  opacity: future.length === 0 ? 0.5 : 1,
                }}
              >
                <MdRedo size={22} color={isDarkMode ? "#f8fafc" : "#334155"} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={isSaving ? "editor-panel-btn" : "editor-save-btn"}
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
                className="editor-panel-btn"
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
