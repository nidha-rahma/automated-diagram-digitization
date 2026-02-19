import React from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { MarkerType } from 'reactflow';
import flowData from './mock/sample_flow.json';
import { TaskNode, CircleNode, IONode, DiamondNode } from './nodes/CustomNodes';
import "./App.css";

const nodeTypes = {
  taskNode: TaskNode,
  circleNode: CircleNode,
  ioNode: IONode,
  diamondNode: DiamondNode,
};

function App() {
  const { nodes, edges } = flowData;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Flowchart Canvas</h2>
      <ReactFlow nodes={nodes} edges={edges} fitView nodeTypes={nodeTypes} />
    </div>
  );
}

export default App;