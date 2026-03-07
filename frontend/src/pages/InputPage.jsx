import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileJson,
  Image as ImageIcon,
  Send,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import "./InputPage.css";
import { uploadAndAnalyze, createFlowchart } from "../services/api";

export default function InputPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("image");

  // States
  const [promptText, setPromptText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "image" && imageFile) {
      try {
        setIsLoading(true);
        // Get JSON from AI
        const flowData = await uploadAndAnalyze(imageFile);

        // Save JSON to PostgreSQL db
        const dbRecord = await createFlowchart(flowData);

        navigate(`/flowchart/${dbRecord.id}`, {
          state: { flowData: dbRecord.flow_data },
        });
      } catch (error) {
        console.error("Analysis failed: ", error);
        alert("Failed to analyze the flowchart. Is your backend running?");
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "json" && jsonText) {
      // Quick fallback for the JSON tab!
      try {
        setIsLoading(true);
        const flowData = JSON.parse(jsonText);
        const dbRecord = await createFlowchart(flowData);

        navigate(`/flowchart/${dbRecord.id}`, {
          state: { flowData: dbRecord.flow_data },
        });
      } catch (err) {
        alert("Invalid JSON format");
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

  return (
    <div className="input-page-container">
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
            {activeTab === "json" && (
              <div className="input-group slide-in">
                <label htmlFor="jsonInput">Paste flow logic in JSON</label>
                <textarea
                  id="jsonInput"
                  placeholder='{"nodes": [{"id": "1", "type": "start"}], "edges": []}'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="modern-textarea font-mono"
                />
              </div>
            )}
          </div>

          <div className="form-footer">
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
    </div>
  );
}
