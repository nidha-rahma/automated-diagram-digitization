import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "reactflow";
import flowData from "../../mock/loop_flow3.json";

// Column snapping - assigning specific columns to nodes based on their X value
const snapToColumns = (nodes) => {
  return nodes.map((node) => {
    const isLeftColumn = node.position.x < 350;
    const targetCenterX = isLeftColumn ? 250 : 550;
    const nodeWidth = node.width || 120; // fallback
    const centeredX = targetCenterX - node.width / 2;

    return {
      ...node,
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

const alignedNodes = snapToColumns(flowData.nodes);

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
