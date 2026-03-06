import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputPage from './pages/InputPage';
import Flowchart from './components/Flowchart';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/flowchart" element={<Flowchart />} />
      </Routes>
    </Router>
  );
}
