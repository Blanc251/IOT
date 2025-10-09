import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;