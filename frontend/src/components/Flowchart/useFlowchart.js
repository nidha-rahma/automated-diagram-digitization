import { useState, useCallback } from 'react';
import {
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    MarkerType,
} from 'reactflow';
import flowData from '../../mock/sample_flow.json';
import { getLayoutedElements } from '../../utils/layout';

// Initial Layout Calculation
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    flowData.nodes,
    flowData.edges.map((edge) => ({
        ...edge,
        sourceHandle:
            edge.label?.toUpperCase() === 'YES'
                ? 'yes'
                : edge.label?.toUpperCase() === 'NO'
                    ? 'no'
                    : 'out',
        targetHandle: 'in',
        type: 'step',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#000',
        },
        style: { stroke: '#000' },
    }))
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
                        type: 'step',
                        style: { stroke: '#000' },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#000',
                        },
                    },
                    eds
                )
            ),
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
        [screenToFlowPosition, setNodes]
    );

    return {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDragOver,
        onDrop
    };
};
