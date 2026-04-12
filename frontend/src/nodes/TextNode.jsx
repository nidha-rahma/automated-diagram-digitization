import { BaseNode } from "./BaseNode";

export function TextNode(props) {
  return (
    <BaseNode {...props}>
      {/* No background shape — just the label renders from BaseNode */}
    </BaseNode>
  );
}
