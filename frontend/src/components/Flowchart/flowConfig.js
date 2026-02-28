import { MarkerType } from 'reactflow';
import { TaskNode, CircleNode, IONode, DiamondNode } from '../../nodes/CustomNodes';

export const nodeTypes = {
    taskNode: TaskNode,
    circleNode: CircleNode,
    ioNode: IONode,
    diamondNode: DiamondNode,
};

export const defaultEdgeOptions = {
    type: 'step',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#000',
    },
    style: { stroke: '#000' },
};
