import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
  Background, // Added for better visual feedback
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './components/Sidebar';

const initialNodes = [];
const initialEdges = [];

function FlowCanvas() {
  const reactFlowWrapper = useRef(null); // Ref to track the canvas container
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Calculate position relative to the wrapper
      //const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
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
    [screenToFlowPosition]
  );

  const onClear = () => {
    setNodes([]);
    setEdges([]);
  };

  
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar />
        

      {/* Wrapper is essential for coordinate math */}
      <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onDragOver={onDragOver}
          onDrop={onDrop}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background variant="dots" gap={15} size={1} />
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