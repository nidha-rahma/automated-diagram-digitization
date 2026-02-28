import React from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNodes.css';

export function CircleNode({ data }) {
    return (
        <div className="circle-node">
            <Handle id="in" type="target" position={Position.Top} />
            <Handle id="left" type="target" position={Position.Left} />
            {data.label}
            <Handle id="right" type="target" position={Position.Right} />
            <Handle id="out" type="source" position={Position.Bottom} />
        </div>
    );
}

export function DiamondNode({ data }) {
    return (
        <div className="diamond-node">
            <Handle id="in" type="target" position={Position.Top} />
            <div className="diamond-shape">
                <span>{data.label}</span>
            </div>
            <Handle id="yes" type="source" position={Position.Left} />
            <Handle id="no" type="source" position={Position.Right} />
            <Handle id="out" type="source" position={Position.Bottom} />
        </div>
    );
}

export function IONode({ data }) {
    return (
        <div className="io-node">
            <Handle id="in" type="target" position={Position.Top} />

            <div className="io-shape">
                {data.label}
            </div>

            <Handle id="out" type="source" position={Position.Bottom} />
        </div>
    );
}

export function TaskNode({ data }) {
    return (
        <div className="task-node">
            <Handle id="in" type="target" position={Position.Top} />
            {data.label}
            <Handle id="out" type="source" position={Position.Bottom} />
        </div>
    );
}
