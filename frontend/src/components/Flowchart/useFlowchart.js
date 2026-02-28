import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "reactflow";
import flowData from "../../mock/loop_flow.json";
import { getLayoutedElements } from "../../utils/layout";

// Sort the edges based on the target node's original X position
// This tells the dagre layout engine the correct left-to-right order
const sortedEdges = [...flowData.edges].sort((edgeA, edgeB) => {
  const targetNodeA = flowData.nodes.find((n) => n.id === edgeA.target);
  const targetNodeB = flowData.nodes.find((n) => n.id === edgeB.target);

  if (targetNodeA && targetNodeB) {
    return targetNodeA.position.x - targetNodeB.position.x;
  }
  return 0;
});

// Initial Layout Calculation
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  flowData.nodes,
  sortedEdges.map((edge) => ({
    ...edge,
    sourceHandle: edge.sourceHandle || "bottom",
    targetHandle: edge.targetHandle || "top",
    type: "step",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#fff",
    },
    style: { stroke: "#fff" },
  })),
);

export const useFlowchart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "step",
            style: { stroke: "#fff" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#fff",
            },
          },
          eds,
        ),
      ),
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

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const snappedX = Math.round((position.x - 75) / 15) * 15;
      const snappedY = Math.round((position.y - 20) / 15) * 15;

      let defaultW = 120;
      let defaultH = 60;

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
