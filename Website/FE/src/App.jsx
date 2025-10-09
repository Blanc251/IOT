import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DataSensor from './components/DataSensor';
import ActionHistory from './components/ActionHistory';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-sensor" element={<DataSensor />} />
          <Route path="/action-history" element={<ActionHistory />} />
          {/* Add a placeholder route for the profile page */}
          <Route path="/profile" element={<h1>Profile Page</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;