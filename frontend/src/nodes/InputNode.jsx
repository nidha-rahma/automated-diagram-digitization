import { BaseNode } from "./BaseNode";

export function InputNode(props) {
  const customFill = props.data?.fill;

  return (
    <BaseNode {...props}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: customFill || "var(--node-bg)",
          border: "1px solid var(--node-border)",
          borderRadius: "2px",
          transform: "skewX(-20deg)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </BaseNode>
  );
}
