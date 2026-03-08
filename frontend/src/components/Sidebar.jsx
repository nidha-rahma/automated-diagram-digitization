import React from "react";

const nodeTypes = [
  { type: "start", label: "Start" },
  { type: "process", label: "Process" },
  { type: "decision", label: "Decision" },
  { type: "io", label: "I/O" },
  //{ type: 'annotation', label: 'Annotation' },
];

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "all";

    // Interaction Tip: Makes the drag look cleaner in some browsers
    event.target.style.opacity = "0.5";
  };

  const onDragEnd = (event) => {
    event.target.style.opacity = "1";
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.description}>Drag these onto the canvas:</div>
      {nodeTypes.map((node) => (
        <div
          key={node.type}
          style={styles.item}
          onDragStart={(event) => onDragStart(event, node.type)}
          onDragEnd={onDragEnd} // Resets opacity
          draggable
        >
          {node.label}
        </div>
      ))}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 200,
    padding: "15px",
    borderRight: "1px solid var(--node-border)",
    backgroundColor: "var(--sidebar-bg)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  description: {
    fontSize: "12px",
    marginBottom: "10px",
    color: "var(--global-text)",
    opacity: 0.7,
  },
  item: {
    padding: "10px",
    border: "1px solid var(--node-border)",
    borderRadius: "5px",
    backgroundColor: "var(--node-bg)",
    color: "var(--node-text)",
    cursor: "grab",
    textAlign: "center",
    fontWeight: "500",
    transition: "all 0.2s ease",
    userSelect: "none", // Prevents text highlighting while dragging
  },
};

export default Sidebar;
