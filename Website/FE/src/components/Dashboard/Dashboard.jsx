import React, { useState, useEffect, useRef } from 'react';
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

const initialChartData = {
    labels: [],
    datasets: [
        {
            label: 'Temperature (°C)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
        },
        {
            label: 'Humidity (%)',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
        },
        {
            label: 'Light (nits)',
            data: [],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};

function Dashboard({ sensorData, ledStatus, sendCommand, isEsp32DataConnected, deviceLoading }) {
    const [chartData, setChartData] = useState(initialChartData);

    useEffect(() => {
        if (!sensorData || typeof sensorData.temperature === 'undefined') return;

        const { temperature, humidity, light } = sensorData;
        const newLabel = new Date().toLocaleTimeString();

        setChartData(prevData => {
            const labels = [...prevData.labels, newLabel].slice(-10);
            const newTempData = [...prevData.datasets[0].data, temperature].slice(-10);
            const newHumidityData = [...prevData.datasets[1].data, humidity].slice(-10);
            const newLightData = [...prevData.datasets[2].data, light].slice(-10);
            return {
                ...prevData,
                labels,
                datasets: [
                    { ...prevData.datasets[0], data: newTempData },
                    { ...prevData.datasets[1], data: newHumidityData },
                    { ...prevData.datasets[2], data: newLightData },
                ]
            };
        });
    }, [sensorData]);

    return (
        <div className={styles.dashboardContentWrapper}>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <div className={`${styles.statusIndicator} ${isEsp32DataConnected ? styles.connected : styles.disconnected}`}>
                    {isEsp32DataConnected ? 'ESP32 Data Connected' : 'ESP32 Data Disconnected'}
                </div>
            </div>

            <div className={styles.summaryCardsContainer}>
                <SummaryCard
                    title="Temperature"
                    value={sensorData?.temperature || 0}
                    unit="°C"
                    status="Normal"
                    statusType="normal"
                />
                <SummaryCard
                    title="Humidity"
                    value={sensorData?.humidity || 0}
                    unit="%"
                    status="High"
                    statusType="high"
                />
                <SummaryCard
                    title="Light"
                    value={sensorData?.light || 0}
                    unit="nits"
                    status="Bright"
                    statusType="bright"
                />
            </div>

            <div className={styles.chartsContainer}>
                <div className={styles.chartCard}>
                    <h3>Environmental Parameters</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </div>
            </div>

            <DeviceControls
                ledStatus={ledStatus}
                sendCommand={sendCommand}
                isEsp32DataConnected={isEsp32DataConnected}
                deviceLoading={deviceLoading}
            />
        </div>
    );
}
export default Dashboard;