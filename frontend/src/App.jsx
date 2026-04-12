import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import Flowchart from "./components/Flowchart";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>Light</span>
        <label className="theme-toggle-switch">
          <input
            type="checkbox"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <span className="theme-toggle-slider" />
        </label>
        <span style={{ fontSize: '16px' }}>Dark</span>
      </div>
      <Router>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/flowchart/:id" element={<Flowchart />} />
      </Routes>
    </Router>
    </div>
  );
}
