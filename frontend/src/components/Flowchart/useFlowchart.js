import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "reactflow";
import flowData from "../../mock/loop_flow.json";

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
    const nodeWidth =
      node.width || (node.style && node.style.width) || maxWidths[node.type];
    // Update maxWidths with maximum width of each node
    if (nodeWidth > maxWidths[node.type]) {
      maxWidths[node.type] = nodeWidth;
    }
  });

  const TOLERANCE = 150;
  const columns = [];

  const nodesWithCenters = nodes.map((node) => {
    const finalWidth = maxWidths[node.type];
    const trueCenterX = node.position.x + finalWidth / 2;
    return { ...node, trueCenterX, finalWidth };
  });

  // Sort nodes based on X value
  const sortedNodes = [...nodesWithCenters].sort(
    (a, b) => a.trueCenterX - b.trueCenterX,
  );

  sortedNodes.forEach((node) => {
    const cx = node.trueCenterX;

    // Checks if node belongs to an existing column
    const existingCol = columns.find(
      (col) => Math.abs(col.averageCenterX - cx) < TOLERANCE,
    );

    if (existingCol) {
      // Add node to exisitng cols
      existingCol.centerValues.push(cx);
      existingCol.averageCenterX =
        existingCol.centerValues.reduce((sum, val) => sum + val, 0) /
        existingCol.centerValues.length;
    } else {
      // Create new col
      columns.push({ centerValues: [cx], averageCenterX: cx });
    }
  });

  return nodesWithCenters.map((node) => {
    const myColumn = columns.find(
      (col) => Math.abs(col.averageCenterX - node.trueCenterX) < TOLERANCE,
    );

    const targetCenterX = myColumn.averageCenterX;
    const centeredX = targetCenterX - node.finalWidth / 2;
    const { trueCenterX, finalWidth, ...cleanNode } = node;

    return {
      ...cleanNode,
      style: { ...cleanNode.style, width: node.finalWidth },
      position: {
        x: centeredX,
        y: cleanNode.position.y,
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

  const applyAutoLayout = useCallback(() => {
    setNodes((currentNodes) => normaliseAndSnap(currentNodes));
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const isVerticalDrop =
          edge.sourceHandle === "bottom" && edge.targetHandle === "top";
        return { ...edge, type: isVerticalDrop ? "straight" : "smoothstep" };
      }),
    );
  }, [setNodes, setEdges]);

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
    applyAutoLayout,
  };
};
