const API_URL = "http://localhost:8000";

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  return await response.json();
};

export const createFlowchart = async (flowData) => {
  const response = await fetch(`${API_URL}/flowcharts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Untitled Flowchart",
      flow_data: flowData,
    }),
  });

  if (!response.ok) throw new Error("Failed to save flowchart to database");
  return await response.json();
};

export const getFlowchart = async (id) => {
  const response = await fetch(`${API_URL}/flowcharts/${id}`);
  if (!response.ok) throw new Error("Flowchart not found");
  return await response.json();
};

export const updateFlowchart = async (id, updates) => {
  const response = await fetch(`${API_URL}/flowcharts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to update flowchart");
  return await response.json();
};
