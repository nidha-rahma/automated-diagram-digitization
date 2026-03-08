const HISTORY_KEY = "clickflow_recent";

export const saveToHistory = (id, title) => {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

  // Remove already existing flowchart to move it to top
  history = history.filter((item) => item.id !== id);

  history.unshift({
    id,
    title: title || "Untitled Flowchart",
    lastAccessed: new Date().toISOString(),
  });

  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
};
