import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SummaryCard from '../SummaryCard/SummaryCard';
import DeviceControls from '../DeviceControl/DeviceControls';

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
    Filler,
} from 'chart.js';

import styles from './Dashboard.module.css';

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

const initialChartData = {
    labels: [],
    datasets: [
        {
            label: 'Temp (°C)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true,
        },
        {
            label: 'Humidity (%)',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true,
        },
    ],
};

const initialLightChartData = {
    labels: [],
    datasets: [{
        label: 'Light (nits)',
        data: [],
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.4,
        fill: true,
    }]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
};

function Dashboard({ ledStatus, sendCommand, isMqttConnected }) {
    const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0, light: 0 });
    const [tempHumidityData, setTempHumidityData] = useState(initialChartData);
    const [lightData, setLightData] = useState(initialLightChartData);
    const intervalRef = useRef(null);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_URL}/data`);
            if (response.data.sensors) {
                const { temperature, humidity, light } = response.data.sensors;
                setSensorData({ temperature, humidity, light });

                const newLabel = new Date().toLocaleTimeString();

                setTempHumidityData(prevData => {
                    const labels = [...prevData.labels, newLabel].slice(-10);
                    const newTempData = [...prevData.datasets[0].data, temperature].slice(-10);
                    const newHumidityData = [...prevData.datasets[1].data, humidity].slice(-10);
                    return {
                        ...prevData,
                        labels,
                        datasets: [
                            { ...prevData.datasets[0], data: newTempData },
                            { ...prevData.datasets[1], data: newHumidityData },
                        ]
                    };
                });

                setLightData(prevData => {
                    const labels = [...prevData.labels, newLabel].slice(-10);
                    const newLightData = [...prevData.datasets[0].data, light].slice(-10);
                    return {
                        ...prevData,
                        labels,
                        datasets: [{ ...prevData.datasets[0], data: newLightData }]
                    };
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const startPolling = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchData, 3000);
    };

    useEffect(() => {
        if (isMqttConnected) {
            fetchData();
            startPolling();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isMqttConnected]);

    return (
        <div className={styles.dashboardContentWrapper}>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <div className={`${styles.statusIndicator} ${isMqttConnected ? styles.connected : styles.disconnected}`}>
                    {isMqttConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
                </div>
            </div>

            <div className={styles.summaryCardsContainer}>
                <SummaryCard

                    title="Nhiệt độ"
                    value={sensorData.temperature}
                    unit="°C"
                    status="Normal"
                    statusType="normal"
                />
                <SummaryCard

                    title="Độ ẩm"
                    value={sensorData.humidity}
                    unit="%"
                    status="High"
                    statusType="high"
                />
                <SummaryCard

                    title="Ánh sáng"
                    value={sensorData.light}
                    unit="nits"
                    status="Bright"
                    statusType="bright"
                />
            </div>

            <div className={styles.chartsContainer}>
                <div className={styles.chartCard}>
                    <h3>Nhiệt độ & Độ ẩm</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptions} data={tempHumidityData} />
                    </div>
                </div>
                <div className={styles.chartCard}>
                    <h3>Ánh sáng</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptions} data={lightData} />
                    </div>
                </div>
            </div>

            <DeviceControls ledStatus={ledStatus} sendCommand={sendCommand} isMqttConnected={isMqttConnected} />
        </div>
    );
}
export default Dashboard;