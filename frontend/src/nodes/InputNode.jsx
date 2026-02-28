import { BaseNode } from "./BaseNode";

export function InputNode(props) {
  return (
    <BaseNode {...props}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "white",
          border: "1px solid #777",
          borderRadius: "2px",
          transform: "skewX(-20deg)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </BaseNode>
  );
}
