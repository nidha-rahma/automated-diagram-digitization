import React from "react";
import { useReactFlow } from "reactflow";
import { useHistory } from "../hooks/HistoryContext";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";
import "./TextStyleToolbar.css";

const FONT_SIZES = [10, 12, 14, 16, 20, 24];
const COLORS = ["#ffffff", "#000000", "#facc15", "#4ade80", "#60a5fa"];

export function TextStyleToolbar({ selectedNode, recentColors = [], setRecentColors }) {
  const { setNodes } = useReactFlow();
  const { takeSnapShot } = useHistory();

  if (!selectedNode) return null;

  const ts = selectedNode.data.textStyle || {};

  const applyStyle = (patch) => {
    takeSnapShot();
    
    // Add to recent colors if it's a new custom color
    if (patch.color && !COLORS.includes(patch.color) && !recentColors.includes(patch.color)) {
      setRecentColors(prev => {
        const updated = [...prev, patch.color];
        // Keep max 5 recent colors
        if (updated.length > 5) return updated.slice(updated.length - 5);
        return updated;
      });
    }

    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, textStyle: { ...ts, ...patch } } }
          : n
      )
    );
  };

  const getAlignIcon = (align) => {
    switch (align) {
      case "left": return <AlignLeft size={16} />;
      case "right": return <AlignRight size={16} />;
      case "center":
      default: return <AlignCenter size={16} />;
    }
  };

  return (
    <div className="text-style-toolbar">
      {/* Bold */}
      <button
        className={`ts-btn ${ts.bold ? "active" : ""}`}
        onClick={() => applyStyle({ bold: !ts.bold })}
        title="Bold"
      >
        <Bold size={16} strokeWidth={2.5} />
      </button>

      {/* Italic */}
      <button
        className={`ts-btn ${ts.italic ? "active" : ""}`}
        onClick={() => applyStyle({ italic: !ts.italic })}
        title="Italic"
      >
        <Italic size={16} strokeWidth={2.5} />
      </button>

      <div className="ts-divider" />

      {/* Font size */}
      <div className="ts-select-wrapper">
        <select
          className="ts-select"
          value={ts.fontSize || 12}
          onChange={(e) => applyStyle({ fontSize: Number(e.target.value) })}
          title="Font size"
        >
          {FONT_SIZES.map((s) => (
             <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>

      <div className="ts-divider" />

      {/* Alignment */}
      {["left", "center", "right"].map((align) => (
         <button
          key={align}
          className={`ts-btn ${(ts.align || "center") === align ? "active" : ""}`}
          onClick={() => applyStyle({ align })}
          title={`Align ${align}`}
         >
          {getAlignIcon(align)}
         </button>
      ))}

      <div className="ts-divider" />

      {/* Color swatches */}
      <div className="ts-colors">
        {[...COLORS, ...recentColors].map((c) => (
          <button
            key={c}
            className={`ts-swatch ${(ts.color || "#ffffff") === c ? "active" : ""}`}
            style={{ background: c }}
            onClick={() => applyStyle({ color: c })}
            title={c}
          />
        ))}

        {/* Custom color button */}
        {(() => {
          const currentColor = ts.color || "#ffffff";
          const isCustom = !COLORS.includes(currentColor) && !recentColors.includes(currentColor);
          return (
            <label
              className={`ts-swatch custom-color-btn ${isCustom ? "active custom-active" : ""}`}
              title="Custom color"
              style={isCustom ? { background: currentColor, borderStyle: "solid" } : {}}
            >
              {!isCustom && <Plus size={14} color="currentColor" />}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => applyStyle({ color: e.target.value })}
                onBlur={(e) => {
                    // Only apply to state on blur so we don't spam recent color history
                    // when they scroll the color wheel
                    if(e.target.value !== currentColor) applyStyle({ color: e.target.value });
                }}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 0,
                  height: 0,
                  cursor: "pointer"
                }}
              />
            </label>
          );
        })()}
      </div>
    </div>
  );
}
