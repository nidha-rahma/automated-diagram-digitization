import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import Flowchart from "./components/Flowchart";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Router>
        <Routes>
          <Route path="/" element={<InputPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/flowchart/:id" element={<Flowchart theme={theme} toggleTheme={toggleTheme} />} />
        </Routes>
      </Router>
    </div>
  );
}
