import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileJson,
  Image as ImageIcon,
  Send,
  FileText,
  CheckCircle2,
  Loader2,
  Clock,
  ExternalLink,
  PenTool,
  Trash2,
} from "lucide-react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import "./InputPage.css";
import {
  uploadAndAnalyze,
  createFlowchart,
  generateFromPrompt,
} from "../services/api";
import { getHistory, removeFromHistory } from "../services/localHistory";

export default function InputPage({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("image");

  // States
  const [promptText, setPromptText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentFlows, setRecentFlows] = useState([]);

  useEffect(() => {
    setRecentFlows(getHistory());
  }, []);

  const handleDeleteHistory = (e, id) => {
    e.stopPropagation();
    const updatedHistory = removeFromHistory(id);
    setRecentFlows(updatedHistory);
  };

  const fileInputRef = useRef(null);
  const jsonFileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "image" && imageFile) {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const flowData = await uploadAndAnalyze(imageFile);
        const dbRecord = await createFlowchart(flowData);
        navigate(`/flowchart/${dbRecord.id}`, { state: { flowData: dbRecord.flow_data } });
      } catch (error) {
        console.error("Analysis failed:", error);
        setErrorMsg(error.message || "Failed to analyze the flowchart. Is your backend running?");
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "prompt" && promptText.trim()) {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const flowData = await generateFromPrompt(promptText);
        const dbRecord = await createFlowchart(flowData);
        navigate(`/flowchart/${dbRecord.id}`, { state: { flowData: dbRecord.flow_data } });
      } catch (error) {
        console.error("Prompt generation failed:", error);
        setErrorMsg(error.message || "Failed to generate flowchart from text.");
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "json" && jsonText) {
      // Quick fallback for the JSON tab!
      try {
        setIsLoading(true);
        setErrorMsg("");
        const flowData = JSON.parse(jsonText);
        const dbRecord = await createFlowchart(flowData);
        navigate(`/flowchart/${dbRecord.id}`, { state: { flowData: dbRecord.flow_data } });
      } catch (err) {
        setErrorMsg(err instanceof SyntaxError ? "Invalid JSON format — please check your input." : (err.message || "Failed to load JSON."));
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleJsonFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);

        setJsonText(JSON.stringify(parsedJson, null, 2));
      } catch (err) {
        console.error("Invalid JSON:", err);
        alert("The uploaded file does not contain valid JSON.");
      }
    };
    reader.readAsText(file);

    e.target.value = "";
  };

  const handleCreateBlank = async () => {
    try {
      setIsLoading(true);
      // Create an empty layout in the database
      const blankData = { nodes: [], edges: [] };
      const dbRecord = await createFlowchart(blankData);

      // Navigate to the new blank canvas
      navigate(`/flowchart/${dbRecord.id}`, {
        state: { flowData: dbRecord.flow_data },
      });
    } catch (error) {
      console.error("Failed to create blank flowchart: ", error);
      alert("Could not initialize a blank canvas. Check your backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="input-page-container">
      <div className="theme-toggle-container">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {theme === 'dark' ? (
            <MdLightMode size={22} color="#f8fafc" />
          ) : (
            <MdDarkMode size={22} color="#334155" />
          )}
        </button>
      </div>

      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="glass-panel">
        <header className="panel-header">
          <div className="logo-container">
            <h1>ClickFlow</h1>
          </div>
        </header>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "image" ? "active" : ""}`}
            onClick={() => setActiveTab("image")}
            type="button"
          >
            <ImageIcon size={18} />
            Image Upload
          </button>
          <button
            className={`tab-btn ${activeTab === "prompt" ? "active" : ""}`}
            onClick={() => setActiveTab("prompt")}
            type="button"
          >
            <FileText size={18} />
            Text Prompt
          </button>
          <button
            className={`tab-btn ${activeTab === "json" ? "active" : ""}`}
            onClick={() => setActiveTab("json")}
            type="button"
          >
            <FileJson size={18} />
            JSON Data
          </button>
          <button
            className={`tab-btn ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => setActiveTab("recent")}
            type="button"
          >
            <Clock size={18} />
            Recent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="tab-content">
            {/* Image Tab */}
            {activeTab === "image" && (
              <div className="input-group slide-in">
                <label>Upload a flowchart image</label>
                <div
                  className={`drop-zone ${isDragging ? "dragging" : ""} ${imageFile ? "has-file" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden-input"
                  />

                  {imageFile ? (
                    <div className="file-success">
                      <CheckCircle2 size={48} className="success-icon" />
                      <p className="file-name">{imageFile.name}</p>
                      <span className="file-size">
                        {(imageFile.size / 1024).toFixed(1)} KB
                      </span>
                      <p className="click-to-change">
                        Click or drag to change file
                      </p>
                    </div>
                  ) : (
                    <div className="drop-content">
                      <div className="upload-icon-container">
                        <Upload size={32} />
                      </div>
                      <p className="drop-title">Drag & drop an image here</p>
                      <p className="drop-subtitle">
                        or click to browse from your device
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prompt Tab */}
            {activeTab === "prompt" && (
              <div className="input-group slide-in">
                <label htmlFor="promptInput">Describe your algorithm</label>
                <textarea
                  id="promptInput"
                  placeholder="E.g., A user logs in, if successful they go to the dashboard, otherwise they see an error..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="modern-textarea"
                />
              </div>
            )}

            {/* JSON Tab */}
            {/* JSON Tab */}
            {activeTab === "json" && (
              <div className="input-group slide-in">
                <label htmlFor="jsonInput">Paste flow logic in JSON</label>
                <textarea
                  id="jsonInput"
                  placeholder='{"nodes": [{"id": "1", "type": "start"}], "edges": []}'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="modern-textarea font-mono"
                  style={{ minHeight: "160px" }} // Slightly shorter to fit the button beautifully
                />

                {/* NEW: JSON File Upload Button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Or upload a file directly:
                  </span>

                  <input
                    type="file"
                    accept=".json,application/json"
                    ref={jsonFileInputRef}
                    onChange={handleJsonFileUpload}
                    className="hidden-input"
                  />

                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "#818cf8",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(99, 102, 241, 0.2)";
                      e.target.style.borderColor = "#6366f1";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(99, 102, 241, 0.1)";
                      e.target.style.borderColor = "rgba(99, 102, 241, 0.2)";
                    }}
                  >
                    <Upload size={14} />
                    Upload .json
                  </button>
                </div>
              </div>
            )}

            {/* Recent Flowcharts Tab */}
            {activeTab === "recent" && (
              <div className="input-group slide-in">
                <label>Your Recent Work</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    overflowY: "auto",
                    maxHeight: "250px",
                    paddingRight: "5px",
                  }}
                >
                  {recentFlows.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#64748b",
                        padding: "2rem",
                      }}
                    >
                      <Clock
                        size={32}
                        style={{ opacity: 0.5, marginBottom: "10px" }}
                      />
                      <p>No recent flowcharts found on this device.</p>
                    </div>
                  ) : (
                    recentFlows.map((flow) => (
                      <div
                        key={flow.id}
                        onClick={() => navigate(`/flowchart/${flow.id}`)}
                        className="recent-history-item"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          background: "rgba(30, 41, 59, 0.6)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: "0 0 4px 0",
                              color: "#f8fafc",
                              fontSize: "1.05rem",
                              fontWeight: 500,
                            }}
                          >
                            {flow.title}
                          </h4>
                          <span
                            style={{ fontSize: "0.8rem", color: "#94a3b8" }}
                          >
                            Last opened:{" "}
                            {new Date(flow.lastAccessed).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <button
                            onClick={(e) => handleDeleteHistory(e, flow.id)}
                            className="history-delete-btn"
                            title="Remove from history"
                            type="button"
                          >
                            <Trash2 size={18} />
                          </button>
                          <ExternalLink
                            size={18}
                            color="#818cf8"
                            style={{ opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-footer">
            {errorMsg && (
              <div className="error-banner">
                <span className="error-icon">⚠</span>
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              className="generate-btn"
              disabled={
                isLoading ||
                (activeTab === "prompt" && !promptText.trim()) ||
                (activeTab === "image" && !imageFile) ||
                (activeTab === "json" && !jsonText.trim())
              }
            >
              {isLoading ? (
                <>
                  <span>Analysing Flowchart</span>
                  <Loader2 size={18} className="btn-icon animate-spin" />
                </>
              ) : (
                <>
                  <span>Generate Flowchart</span>
                  <Send size={18} className="btn-icon" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <button
        onClick={handleCreateBlank}
        disabled={isLoading}
        className="start-scratch-btn"
        title="Start from a blank canvas"
      >
        <PenTool size={20} className="scratch-icon" />
        <span>Create new flowchart</span>
      </button>
    </div>
  );
}
