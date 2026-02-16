import { useState } from "react";

export function useEditableNode(initialNodes) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(initialNodes);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
  };

  const onKeyDown = (evt) => {
    if (evt.key === "Enter") setIsEditing(false);
  };

  const onChange = (evt) => {
    setLabel(evt.target.value);
  };

  return {
    isEditing,
    label,
    onDoubleClick,
    onBlur,
    onKeyDown,
    onChange,
  };
}
