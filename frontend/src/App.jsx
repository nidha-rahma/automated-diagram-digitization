import React from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { MarkerType } from 'reactflow';
import flowData from './mock/sample_flow.json';
import "./App.css";

function App() {
  const { nodes, edges } = flowData;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Flowchart Canvas</h2>
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
}

export default App;