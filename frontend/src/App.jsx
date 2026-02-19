import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './components/Sidebar';
import flowData from './mock/sample_flow.json';
import { TaskNode, CircleNode, IONode, DiamondNode } from './nodes/CustomNodes';
import { getLayoutedElements } from './utils/layout';
import "./App.css";

// --- Node Types Configuration ---
const nodeTypes = {
  taskNode: TaskNode,
  circleNode: CircleNode,
  ioNode: IONode,
  diamondNode: DiamondNode,
};

// --- Default Edge Options ---
const defaultEdgeOptions = {
  type: 'step',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#000',
  },
  style: { stroke: '#000' },
};

// --- Initial Layout Calculation (preserve existing logic) ---
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  flowData.nodes,
  flowData.edges.map(edge => ({
    ...edge,
    sourceHandle: edge.label?.toUpperCase() === 'YES' ? 'yes' :
      edge.label?.toUpperCase() === 'NO' ? 'no' : 'out',
    targetHandle: 'in',
    type: 'step',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#000',
    },
    style: { stroke: '#000' }
  }))
);

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'step', style: { stroke: '#000' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const snappedX = Math.round((position.x - 75) / 15) * 15;
      const snappedY = Math.round((position.y - 20) / 15) * 15;

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position: { x: snappedX, y: snappedY },
        data: { label: `${type.toUpperCase()}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          defaultEdgeOptions={defaultEdgeOptions}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
