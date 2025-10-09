import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCard from './SummaryCard';
import DeviceControls from './DeviceControls';

// --- Import Chart.js elements ---
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler, // Import Filler for gradient backgrounds
} from 'chart.js';

// --- Import Icons ---
import { BsThermometerHalf, BsDropletHalf, BsSun } from 'react-icons/bs';

// --- IMPORTANT: Register the components you will use ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const API_URL = 'http://localhost:3001/api';

// --- Chart Data & Options (Static for this example) ---
// In a real application, you would fetch this historical data from your backend
const chartLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

const chartData = {
    tempHumidity: {
        labels: chartLabels,
        datasets: [
            {
                label: 'Temp (°C)',
                data: [26, 28, 30, 29, 28, 27, 26],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Humidity (%)',
                data: [60, 58, 62, 65, 68, 70, 72],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    },
    light: {
        labels: chartLabels,
        datasets: [{
            label: 'Light (nits)',
            data: [75, 95, 100, 90, 70, 40, 20],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4,
            fill: true,
        }]
    }
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
};


function Dashboard() {
    const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0, light: 0 });
    const [ledStatus, setLedStatus] = useState({ led1: 'off', led2: 'off', led3: 'off' });

    useEffect(() => {
        // ... (your existing useEffect data fetching logic remains the same)
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/data`);
                if (response.data.sensors) setSensorData(response.data.sensors);
                if (response.data.leds) setLedStatus(response.data.leds);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendCommand = async (command) => {
        // ... (your existing sendCommand logic remains the same)
        try {
            await axios.post(`${API_URL}/command`, { command });
        } catch (error) {
            console.error(`Error sending command "${command}":`, error);
        }
    };

    return (
        <div className="dashboard-content-wrapper">
            <h1>Dashboard</h1>

            {/* --- Row 1: Summary Cards --- */}
            <div className="summary-cards-container">
                <SummaryCard
                    icon={<BsThermometerHalf />}
                    title="Nhiệt độ"
                    value={sensorData.temperature}
                    unit="°C"
                    status="Normal"
                    statusType="normal"
                />
                <SummaryCard
                    icon={<BsDropletHalf />}
                    title="Độ ẩm"
                    value={sensorData.humidity}
                    unit="%"
                    status="High"
                    statusType="high"
                />
                <SummaryCard
                    icon={<BsSun />}
                    title="Ánh sáng"
                    value={sensorData.light}
                    unit="nits"
                    status="Bright"
                    statusType="bright"
                />
            </div>

            {/* --- Row 2: Charts --- */}
            <div className="charts-container">
                <div className="chart-card">
                    <h3>Nhiệt độ & Độ ẩm</h3>
                    <div className="chart-wrapper">
                        <Line options={chartOptions} data={chartData.tempHumidity} />
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Ánh sáng</h3>
                    <div className="chart-wrapper">
                        <Line options={chartOptions} data={chartData.light} />
                    </div>
                </div>
            </div>

            {/* --- Row 3: Device Controls --- */}
            <DeviceControls ledStatus={ledStatus} sendCommand={sendCommand} />

        </div>
    );
}

export default Dashboard;