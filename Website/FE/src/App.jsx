import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/DashBoard/Dashboard';
import DataSensor from './components/DataSensor/DataSensor';
import ActionHistory from './components/ActionHistory/ActionHistory';
import Profile from './components/Profile/Profile';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [ledStatus, setLedStatus] = useState({ led1: 'off', led2: 'off', led3: 'off' });
  const [isMqttConnected, setIsMqttConnected] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/data`);
        if (response.data.leds) {
          setLedStatus(response.data.leds);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();

    const ws = new WebSocket('ws://' + window.location.hostname + ':3001');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'MQTT_STATUS') {
        setIsMqttConnected(message.isConnected);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendCommand = async (command) => {
    const newStatus = { ...ledStatus };
    if (command.startsWith('all')) {
      const state = command === 'allon' ? 'on' : 'off';
      newStatus.led1 = state;
      newStatus.led2 = state;
      newStatus.led3 = state;
    } else {
      const ledName = command.slice(0, 4);
      const state = command.slice(4);
      if (newStatus.hasOwnProperty(ledName)) {
        newStatus[ledName] = state;
      }
    }
    setLedStatus(newStatus);

    try {
      await axios.post(`${API_URL}/command`, { command });
    } catch (error) {
      console.error(`Error sending command "${command}":`, error);
      const response = await axios.get(`${API_URL}/data`);
      if (response.data.leds) {
        setLedStatus(response.data.leds);
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard ledStatus={ledStatus} sendCommand={sendCommand} isMqttConnected={isMqttConnected} />} />
          <Route path="/data-sensor" element={<DataSensor />} />
          <Route path="/action-history" element={<ActionHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;