import React, { useState, useRef, useEffect } from "react";
import { toPng, toSvg } from "html-to-image";
import "./ExportMenu.css";

function downloadFile(href, filename) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
}

export function ExportMenu({ nodes, edges, canvasRef, title }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filename = (title || "flowchart")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  // ── JSON ──────────────────────────────────────────────────────────────────
  const handleExportJSON = () => {
    // Build a UUID → number mapping
    const idMap = {};
    nodes.forEach((node, i) => {
      idMap[node.id] = String(i + 1);
    });

    const cleanNodes = nodes.map((node) => ({
      ...node,
      id: idMap[node.id],
    }));

    const cleanEdges = edges.map((edge) => ({
      ...edge,
      id: `e${idMap[edge.source]}-${idMap[edge.target]}`,
      source: idMap[edge.source] ?? edge.source,
      target: idMap[edge.target] ?? edge.target,
    }));

    const json = JSON.stringify(
      { nodes: cleanNodes, edges: cleanEdges },
      null,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${filename}.json`);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  // ── Shared helper: fit all nodes into view, patch fills, capture, restore ─
  const captureFlow = async (flowEl, captureFunc) => {
    const viewport = flowEl.querySelector(".react-flow__viewport");
    if (!viewport) return null;

    const PADDING = 48; // px padding around the diagram

    // 1. Compute bounding box of all nodes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    nodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const w = node.width || node.style?.width || 150;
      const h = node.height || node.style?.height || 80;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + Number(w));
      maxY = Math.max(maxY, y + Number(h));
    });

    const canvasW = flowEl.offsetWidth;
    const canvasH = flowEl.offsetHeight;
    const originalTransform = viewport.style.transform;

    if (nodes.length > 0 && isFinite(minX)) {
      // 2. Calculate scale + translation to fit the bbox into the canvas
      const bboxW = maxX - minX;
      const bboxH = maxY - minY;
      const scale = Math.min(
        (canvasW - PADDING * 2) / bboxW,
        (canvasH - PADDING * 2) / bboxH,
        1, // never upscale beyond 100%
      );
      const tx = (canvasW - bboxW * scale) / 2 - minX * scale;
      const ty = (canvasH - bboxH * scale) / 2 - minY * scale;

      // 3. Apply fit transform temporarily
      viewport.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    // 4. Patch SVG edge-label rects (html-to-image loses class-based fill → black)
    const patches = [];
    flowEl.querySelectorAll(".react-flow__edge-textbg").forEach((rect) => {
      const computed = getComputedStyle(rect).fill;
      const original = rect.getAttribute("fill");
      rect.setAttribute(
        "fill",
        computed && computed !== "rgb(0, 0, 0)" ? computed : "white",
      );
      patches.push({ rect, original });
    });

    const bg = getComputedStyle(flowEl).backgroundColor || "#171e29";

    try {
      return await captureFunc(flowEl, bg);
    } finally {
      // 5. Restore transform and fill attributes
      viewport.style.transform = originalTransform;
      patches.forEach(({ rect, original }) => {
        if (original === null) rect.removeAttribute("fill");
        else rect.setAttribute("fill", original);
      });
    }
  };

  // ── PNG ───────────────────────────────────────────────────────────────────
  const handleExportPNG = async () => {
    setOpen(false);
    const flowEl = canvasRef.current?.querySelector(".react-flow");
    if (!flowEl) return;
    try {
      const dataUrl = await captureFlow(flowEl, (el, bg) =>
        toPng(el, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: bg,
          filter: (n) =>
            !n.classList?.contains("react-flow__controls") &&
            !n.classList?.contains("react-flow__panel"),
        }),
      );
      downloadFile(dataUrl, `${filename}.png`);
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  // ── SVG ───────────────────────────────────────────────────────────────────
  const handleExportSVG = async () => {
    setOpen(false);
    const flowEl = canvasRef.current?.querySelector(".react-flow");
    if (!flowEl) return;
    try {
      const dataUrl = await captureFlow(flowEl, (el) =>
        toSvg(el, {
          filter: (n) =>
            !n.classList?.contains("react-flow__controls") &&
            !n.classList?.contains("react-flow__panel"),
        }),
      );
      downloadFile(dataUrl, `${filename}.svg`);
    } catch (err) {
      console.error("SVG export failed:", err);
    }
  };

  return (
    <div className="export-menu-wrapper" ref={menuRef}>
      <button
        className="export-trigger-btn"
        onClick={() => setOpen((prev) => !prev)}
        title="Export diagram"
      >
        Export
      </button>

      {open && (
        <div className="export-dropdown">
          <button className="export-option" onClick={handleExportJSON}>
            <span className="export-icon">📄</span>
            Export JSON
          </button>
          <button className="export-option" onClick={handleExportPNG}>
            <span className="export-icon">🖼</span>
            Export PNG
          </button>
          <button className="export-option" onClick={handleExportSVG}>
            <span className="export-icon">✦</span>
            Export SVG
          </button>
        </div>
      )}
    </div>
  );
}
