import { BaseNode } from "./BaseNode";

export function DecisionNode(props) {
  return (
    <BaseNode {...props} minW={120} minH={120}>
      {/* Shape (actual diamond) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: "white",
          border: "1px solid #777",
          // Clip the sqaure into a diamond
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </BaseNode>
  );
}
