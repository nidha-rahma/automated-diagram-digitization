import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  Background,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useFlowchart } from "./useFlowchart";
import { nodeTypes, defaultEdgeOptions } from "./flowConfig";
import Sidebar from "../Sidebar";
import { ExportMenu } from "../ExportMenu";
import { TextStyleToolbar } from "../TextStyleToolbar";
import "../../App.css";

import { MdUndo, MdRedo, MdDarkMode, MdLightMode } from "react-icons/md";
import { HistoryContext } from "../../hooks/HistoryContext";
import { getFlowchart, updateFlowchart } from "../../services/api";
import { saveToHistory } from "../../services/localHistory";

function FlowCanvas({ initialData, initialTitle, dbId, theme, toggleTheme }) {
  const reactFlowWrapper = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const isDarkMode = theme === 'dark';

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
    updateEdgeLabel,
    changeNodeColor,
    addNodeAtCenter,
  } = useFlowchart(initialData);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [edgeLabelEdit, setEdgeLabelEdit] = useState(null);
  const [textEditingNodeId, setTextEditingNodeId] = useState(null);
  const [recentColors, setRecentColors] = useState([]);
  const hasSelectedNodes = nodes.some((n) => n.selected);
  const selectedNode =
    nodes.filter((n) => n.selected).length === 1
      ? nodes.find((n) => n.selected)
      : null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    setEdgeLabelEdit({
      id: edge.id,
      label: edge.label || "",
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    setTextEditingNodeId(node.id);
  }, []);

  const saveEdgeLabel = () => {
    if (!edgeLabelEdit) return;
    updateEdgeLabel(edgeLabelEdit.id, edgeLabelEdit.label);
    setEdgeLabelEdit(null);
  };

  return (
    <div
      className={`${isDarkMode ? "dark-theme" : "light-theme"} flowchart-app-container`}
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        backgroundColor: isDarkMode ? "#0f172a" : "#F7F7F7",
      }}
    >
      <Sidebar
        onColorChange={changeNodeColor}
        hasSelection={hasSelectedNodes}
        selectedNode={selectedNode}
        addNodeAtCenter={addNodeAtCenter}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
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
            onEdgeDoubleClick={onEdgeDoubleClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={() => {
              setEdgeLabelEdit(null);
              setTextEditingNodeId(null);
            }}
            onSelectionChange={(params) => {
              // Clear text editing state if selection changes
              if (
                params.nodes.length !== 1 ||
                params.nodes[0].id !== textEditingNodeId
              ) {
                setTextEditingNodeId(null);
              }
            }}
            snapToGrid={true}
            snapGrid={[15, 15]}
            fitView
          >
            <Background
              variant="dots"
              gap={12}
              size={2}
              color={isDarkMode ? "#4f5052" : "#cbd5e1"}
              style={{ backgroundColor: isDarkMode ? "#171e29" : "#F7f7f7" }}
            />
            <Controls
              style={{
                button: {
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  fill: "white",
                },
              }}
            />

            {/* Text style toolbar*/}
            {selectedNode && textEditingNodeId === selectedNode.id && (
              <Panel position="top-center" style={{ margin: "12px 0 0 0" }}>
                <TextStyleToolbar
                  selectedNode={selectedNode}
                  recentColors={recentColors}
                  setRecentColors={setRecentColors}
                />
              </Panel>
            )}

            <Panel 
              position="top-left" 
              style={{ 
                margin: "12px", 
                marginLeft: "65px", // Make room for the sidebar toggle
                display: "flex",
                alignItems: "center"
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                }}
                className="editor-title-input responsive-title"
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: isDarkMode ? "#f8fafc" : "#1e293b",
                  backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#cbd5e1",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  outline: "none",
                  maxWidth: "150px",
                  width: `${Math.max((title || "").length, 8)}ch`,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.15s ease",
                  cursor: "text",
                  backdropFilter: "blur(8px)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.2)";
                }}
                onBlur={(e) => {
                  handleTitleSave();
                  e.target.style.borderColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#cbd5e1";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.06)";
                }}
              />
            </Panel>

            <Panel
              position="top-right"
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                margin: "12px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                maxWidth: "280px"
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={toggleTheme}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  className="editor-panel-btn"
                  style={{ ...circleButtonStyle, width: "36px", height: "36px" }}
                >
                  {isDarkMode ? <MdLightMode size={18} color="#f8fafc" /> : <MdDarkMode size={18} color="#334155" />}
                </button>
                <button
                  onClick={undo}
                  disabled={past.length === 0}
                  title="Undo"
                  className="editor-panel-btn"
                  style={{
                    ...circleButtonStyle,
                    width: "36px", height: "36px",
                    cursor: past.length === 0 ? "not-allowed" : "pointer",
                    opacity: past.length === 0 ? 0.5 : 1,
                  }}
                >
                  <MdUndo size={20} color={isDarkMode ? "#f8fafc" : "#334155"} />
                </button>
                <button
                  onClick={redo}
                  disabled={future.length === 0}
                  title="Redo"
                  className="editor-panel-btn"
                  style={{
                    ...circleButtonStyle,
                    width: "36px", height: "36px",
                    cursor: future.length === 0 ? "not-allowed" : "pointer",
                    opacity: future.length === 0 ? 0.5 : 1,
                  }}
                >
                  <MdRedo size={20} color={isDarkMode ? "#f8fafc" : "#334155"} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={isSaving ? "editor-panel-btn" : "editor-save-btn"}
                  style={{
                    padding: "0 12px",
                    height: "36px",
                    fontSize: "13px",
                    background: isSaving ? "#475569" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isSaving ? "..." : "Save"}
                </button>
                <ExportMenu
                  nodes={nodes}
                  edges={edges}
                  canvasRef={reactFlowWrapper}
                  title={title}
                />
              </div>
            </Panel>

            <Panel position="bottom-right" style={{ margin: "12px" }}>
              <button
                onClick={applyAutoLayout}
                className="editor-panel-btn auto-layout-btn"
                style={{
                  padding: "8px 12px",
                  background: isDarkMode ? "rgba(54, 58, 70, 0.7)" : "#ffffff",
                  color: isDarkMode ? "#f8fafc" : "#334155",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Auto Layout
              </button>
            </Panel>
            {edgeLabelEdit && (
              <div
                style={{
                  position: "fixed",
                  top: edgeLabelEdit.y - 20,
                  left: edgeLabelEdit.x - 60,
                  zIndex: 1000,
                  background: "var(--node-bg)",
                  border: "2px solid var(--node-border)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  display: "flex",
                }}
              >
                <input
                  autoFocus
                  value={edgeLabelEdit.label}
                  onChange={(e) =>
                    setEdgeLabelEdit({
                      ...edgeLabelEdit,
                      label: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdgeLabel();
                    if (e.key === "Escape") setEdgeLabelEdit(null);
                  }}
                  onBlur={saveEdgeLabel}
                  placeholder="Label text..."
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--node-text)",
                    width: "120px",
                    fontSize: "13px",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                />
              </div>
            )}
          </ReactFlow>
        </HistoryContext.Provider>
      </div>
    </div>
  );
}

export default function Flowchart({ theme, toggleTheme }) {
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
          backgroundColor: theme === 'dark' ? "#0f172a" : "#f8fafc",
          color: theme === 'dark' ? "white" : "black",
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
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </ReactFlowProvider>
  );
}
