import { MarkerType } from "reactflow";
import { ProcessNode } from "../../nodes/ProcessNode";
import { StartNode } from "../../nodes/StartNode";
import { DecisionNode } from "../../nodes/DecisionNode";
import { InputNode } from "../../nodes/InputNode";
import { TextNode } from "../../nodes/TextNode";

export const nodeTypes = {
  process: ProcessNode,
  start: StartNode,
  io: InputNode,
  decision: DecisionNode,
  text: TextNode,
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
