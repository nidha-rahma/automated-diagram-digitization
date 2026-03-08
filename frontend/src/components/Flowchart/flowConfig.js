import { MarkerType } from "reactflow";
import { ProcessNode } from "../../nodes/ProcessNode";
import { StartNode } from "../../nodes/StartNode";
import { DecisionNode } from "../../nodes/DecisionNode";
import { InputNode } from "../../nodes/InputNode";

export const nodeTypes = {
  process: ProcessNode,
  start: StartNode,
  io: InputNode,
  decision: DecisionNode,
};

export const defaultEdgeOptions = {
  type: "step",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "var(--edge-color)",
  },
  style: { stroke: "var(--edge-color)" },
};
