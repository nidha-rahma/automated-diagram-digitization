import { useState, useCallback, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from "reactflow";

// Dynamic column snapping (1D Clustering)
// Assigning specific columns to nodes based on their X value
const normaliseAndSnap = (nodes) => {
  const maxWidths = {
    start: 100,
    process: 150,
    io: 150,
    decision: 120,
    text: 150,
  };
  const DEFAULT_WIDTH = 150;

  nodes.forEach((node) => {
    const nodeWidth =
      node.width || (node.style && node.style.width) || maxWidths[node.type] || DEFAULT_WIDTH;
    // Update maxWidths with maximum width of each node
    if (nodeWidth > (maxWidths[node.type] || DEFAULT_WIDTH)) {
      maxWidths[node.type] = nodeWidth;
    }
  });

  const TOLERANCE = 150;
  const columns = [];

  const nodesWithCenters = nodes.map((node) => {
    const finalWidth = maxWidths[node.type] || DEFAULT_WIDTH;
    const trueCenterX = (node.position?.x || 0) + finalWidth / 2;
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

    if (!myColumn) {
      const cleanNode = { ...node };
      delete cleanNode.trueCenterX;
      delete cleanNode.finalWidth;
      return cleanNode;
    }

    const targetCenterX = myColumn.averageCenterX;
    const centeredX = targetCenterX - node.finalWidth / 2;
    const cleanNode = { ...node };
    delete cleanNode.trueCenterX;
    delete cleanNode.finalWidth;

    return {
      ...cleanNode,
      style: { ...cleanNode.style, width: node.finalWidth },
      position: {
        x: centeredX,
        y: cleanNode.position?.y || 0,
      },
    };
  });
};

export const useFlowchart = (initialData) => {
  const initialSnappedNodes =
    initialData?.nodes?.length > 0 ? normaliseAndSnap(initialData.nodes) : [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialSnappedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(() => {
    const rawEdges = initialData?.edges || [];
    return rawEdges.map((edge) => {
      let isVerticalDrop =
        edge.sourceHandle === "bottom" && edge.targetHandle === "top";

      const sourceNode = initialSnappedNodes.find((n) => n.id === edge.source);
      const targetNode = initialSnappedNodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        if (Math.abs(sourceNode.position.x - targetNode.position.x) > 50) {
          isVerticalDrop = false;
        }
      }

      return {
        ...edge,
        type: isVerticalDrop ? "straight" : "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "var(--edge-color)",
        },
        style: { stroke: "var(--edge-color)" },
      };
    });
  });


  const { screenToFlowPosition } = useReactFlow();

  // History State
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const takeSnapShot = useCallback(() => {
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const edgesCopy = JSON.parse(JSON.stringify(edges));

    setPast((p) => [...p, { nodes: nodesCopy, edges: edgesCopy }]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const prevState = past[past.length - 1];

    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const edgesCopy = JSON.parse(JSON.stringify(edges));

    setFuture((f) => [{ nodes: nodesCopy, edges: edgesCopy }, ...f]);
    setPast((p) => p.slice(0, p.length - 1));

    setNodes(prevState.nodes);
    setEdges(prevState.edges);
  }, [nodes, edges, past, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nextState = future[0];

    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    const edgesCopy = JSON.parse(JSON.stringify(edges));

    setPast((p) => [...p, { nodes: nodesCopy, edges: edgesCopy }]);
    setFuture((f) => f.slice(1));

    setNodes(nextState.nodes);
    setEdges(nextState.edges);
  }, [nodes, edges, future, setNodes, setEdges]);

  const applyAutoLayout = useCallback(() => {
    takeSnapShot();

    setNodes((currentNodes) => {
      const newlyAlignedNodes = normaliseAndSnap(currentNodes);

      setEdges((currentEdges) =>
        currentEdges.map((edge) => {
          let isVerticalDrop =
            edge.sourceHandle === "bottom" && edge.targetHandle === "top";
          const sourceNode = newlyAlignedNodes.find(
            (n) => n.id === edge.source,
          );
          const targetNode = newlyAlignedNodes.find(
            (n) => n.id === edge.target,
          );

          if (sourceNode && targetNode) {
            if (Math.abs(sourceNode.position.x - targetNode.position.x) > 50) {
              isVerticalDrop = false;
            }
          }

          return { ...edge, type: isVerticalDrop ? "straight" : "smoothstep" };
        }),
      );
      return newlyAlignedNodes;
    });
  }, [setNodes, setEdges, takeSnapShot]);

  const onConnect = useCallback(
    (params) => {
      takeSnapShot();
      let isVerticalDrop =
        params.sourceHandle === "bottom" && params.targetHandle === "top";

      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (sourceNode && targetNode) {
        if (Math.abs(sourceNode.position.x - targetNode.position.x) > 50) {
          isVerticalDrop = false;
        }
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: isVerticalDrop ? "straight" : "smoothstep",
            style: { stroke: "var(--edge-color)" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--edge-color)",
            },
          },
          eds,
        ),
      );
    },
    [setEdges, takeSnapShot, nodes],
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

      takeSnapShot();

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
        defaultW = 90;
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
    [screenToFlowPosition, setNodes, takeSnapShot],
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      takeSnapShot();
      setNodes((nds) =>
        nds.filter((node) => !deleted.find((d) => d.id === node.id)),
      );
    },
    [setNodes, takeSnapShot],
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      takeSnapShot();
      setEdges((eds) =>
        eds.filter((edge) => !deleted.find((d) => d.id === edge.id)),
      );
    },
    [setEdges, takeSnapShot],
  );

  const changeNodeColor = useCallback(
    (color, isFinal = true) => {
      if (isFinal) {
        takeSnapShot();
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return {
              ...node,
              data: { ...node.data, fill: color },
            };
          }
          return node;
        }),
      );
    },
    [setNodes, takeSnapShot],
  );

  const updateEdgeLabel = useCallback(
    (edgeId, newLabel) => {
      takeSnapShot();

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              label: newLabel,
              labelStyle: {
                fill: "var(--node-text)",
                fontWeight: 600,
                fontSize: 12,
              },
              labelBgStyle: {
                fill: "var(--node-bg)",
                stroke: "var(--node-border)",
                strokeWidth: 1.5,
                rx: 4,
                ry: 4,
              },
              labelBgPadding: [8, 4],
            };
          }
          return edge;
        }),
      );
    },
    [setEdges, takeSnapShot],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.ctrlKey) {
        if (event.key.toLowerCase() === "z") {
          if (event.shiftKey) {
            event.preventDefault();
            redo();
          } else {
            event.preventDefault();
            undo();
          }
        } else if (event.key.toLowerCase() === "y") {
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
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
  };
};
