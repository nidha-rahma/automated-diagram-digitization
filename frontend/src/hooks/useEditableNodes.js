import { useEffect, useState } from "react";
import { useHistory } from "./HistoryContext";
import { useReactFlow } from "reactflow";

export function useEditableNode(id, initialLabel) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(initialLabel);

  const { setNodes } = useReactFlow();
  const { takeSnapShot } = useHistory();

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  const onDoubleClick = () => {
    setIsEditing(true);
  };

  const onChange = (evt) => {
    setLabel(evt.target.value);
  };

  const saveAndClose = () => {
    setIsEditing(false);

    if (label === initialLabel) return;

    takeSnapShot();

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: label } };
        }
        return node;
      }),
    );
  };

  const onBlur = () => {
    saveAndClose();
  };

  const onKeyDown = (evt) => {
    if (evt.key === "Enter") {
      saveAndClose();
    } else if (evt.key === "Escape") {
      setIsEditing(false);
      setLabel(initialLabel);
    }
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
