import React, { useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { MarkerType } from 'reactflow';
import flowData from './mock/sample_flow.json';
import { TaskNode, CircleNode, IONode, DiamondNode } from './nodes/CustomNodes';
import { getLayoutedElements } from './utils/layout';
import "./App.css";

const nodeTypes = {
  taskNode: TaskNode,
  circleNode: CircleNode,
  ioNode: IONode,
  diamondNode: DiamondNode,
};

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

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Flowchart Canvas</h2>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
      />
    </div>
  );
}

export default App;