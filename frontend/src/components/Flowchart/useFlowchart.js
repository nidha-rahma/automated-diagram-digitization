import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "reactflow";
import flowData from "../../mock/check2.json";

// Dynamic column snapping (1D Clustering)
// Assigning specific columns to nodes based on their X value
const normaliseAndSnap = (nodes) => {
  const maxWidths = {
    start: 100,
    process: 150,
    io: 150,
    decision: 120,
  };

  nodes.forEach((node) => {
    // Update maxWidths with maximum width of each node
    if (node.width && node.width > maxWidths[node.type]) {
      maxWidths[node.type] = node.width;
    }
  });

  const TOLERANCE = 100;
  const columns = [];

  // Sort nodes based on X value
  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

  sortedNodes.forEach((node) => {
    const x = node.position.x;

    // Checks if node belongs to an existing column
    const existingCol = columns.find(
      (col) => Math.abs(col.averageX - x) < TOLERANCE,
    );

    if (existingCol) {
      // Add node to exisitng cols
      existingCol.xValues.push(x);
      existingCol.averageX =
        existingCol.xValues.reduce((sum, val) => sum + val, 0) /
        existingCol.xValues.length;
    } else {
      // Create new col
      columns.push({ xValues: [x], averageX: [x] });
    }
  });

  return nodes.map((node) => {
    const myColumn = columns.find(
      (col) => Math.abs(col.averageX - node.position.x) < TOLERANCE,
    );

    const targetCenterX = myColumn.averageX;
    const finalWidth = maxWidths[node.type];
    const centeredX = targetCenterX - finalWidth / 2;

    return {
      ...node,
      style: { ...node.style, width: finalWidth },
      position: {
        x: centeredX,
        y: node.position.y,
      },
    };
  });
};

// Map edges using json
const initialEdges = flowData.edges.map((edge) => {
  const isVerticalDrop =
    edge.sourceHandle === "bottom" && edge.targetHandle === "top";

  return {
    ...edge,
    type: isVerticalDrop ? "straight" : "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#fff",
    },
    style: { stroke: "#fff" },
  };
});

const alignedNodes = normaliseAndSnap(flowData.nodes);

export const useFlowchart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(alignedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => {
      const isVerticalDrop =
        params.sourceHandle === "bottom" && params.targetHandle === "top";
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: isVerticalDrop ? "straight" : "smoothstep",
            style: { stroke: "#fff" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#fff",
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const snappedX = Math.round((position.x - 75) / 15) * 15;
      const snappedY = Math.round((position.y - 20) / 15) * 15;

      let defaultW = 120,
        defaultH = 60;
      if (type === "decision") {
        defaultW = 120;
        defaultH = 120;
      } else if (type === "start") {
        defaultW = 80;
        defaultH = 40;
      } else if (type === "io") {
        defaultW = 100;
        defaultH = 40;
      }

      const newNode = {
        id: `node_${crypto.randomUUID()}`,
        type,
        position: { x: snappedX, y: snappedY },
        data: { label: `${type.toUpperCase()}` },
        style: { width: defaultW, height: defaultH },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop,
  };
};
