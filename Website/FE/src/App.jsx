import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import DataSensor from './components/DataSensor/DataSensor';
import ActionHistory from './components/ActionHistory/ActionHistory';
import Profile from './components/Profile/Profile';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [ledStatus, setLedStatus] = useState({ led1: 'off', led2: 'off', led3: 'off' });
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0, light: 0 });
  const [isEsp32DataConnected, setIsEsp32DataConnected] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState({ led1: false, led2: false, led3: false });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${API_URL}/data`);
        if (response.data.leds) {
          setLedStatus(response.data.leds);
        }
        if (response.data.sensors) {
          setSensorData(response.data.sensors);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();

    const ws = new WebSocket('ws://' + window.location.hostname + ':3001');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'DATA_STATUS':
          setIsEsp32DataConnected(message.isConnected);
          break;
        case 'SENSOR_DATA':
          setSensorData(message.data);
          break;
        case 'LED_STATUS':
          setLedStatus(message.data);
          setDeviceLoading({ led1: false, led2: false, led3: false });
          break;
        default:
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendCommand = async (command, ledName) => {
    if (ledName === 'all') {
      setDeviceLoading({ led1: true, led2: true, led3: true });
    } else if (ledName) {
      setDeviceLoading(prev => ({ ...prev, [ledName]: true }));
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await axios.post(`${API_URL}/command`, { command });
    } catch (error) {
      console.error(`Error sending command "${command}":`, error);
      setDeviceLoading({ led1: false, led2: false, led3: false });
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
          <Route path="/" element={<Dashboard sensorData={sensorData} ledStatus={ledStatus} sendCommand={sendCommand} isEsp32DataConnected={isEsp32DataConnected} deviceLoading={deviceLoading} />} />
          <Route path="/data-sensor" element={<DataSensor isEsp32DataConnected={isEsp32DataConnected} />} />
          <Route path="/action-history" element={<ActionHistory isEsp32DataConnected={isEsp32DataConnected} />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;