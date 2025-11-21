import React, { useState, useEffect } from 'react';
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

const initialDustChartData = {
    labels: [],
    datasets: [
        {
            label: 'Dust Sensor (0-1000)',
            data: [],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
        },
        {
            label: 'CO2 Sensor (0-100)',
            data: [],
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
        },
    ],
};

const chartOptionsDust = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            max: 1000
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};


function Dashboard({ sensorData, ledStatus, sendCommand, isEsp32DataConnected, deviceLoading, isAlarmOn }) {
    const [chartData, setChartData] = useState(initialChartData);
    const [chartDataDust, setChartDataDust] = useState(initialDustChartData);

    useEffect(() => {
        if (!sensorData || typeof sensorData.temperature === 'undefined') return;

        const { temperature, humidity, light, dust_sensor, co2_sensor } = sensorData;
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

        setChartDataDust(prevData => {
            const labels = [...prevData.labels, newLabel].slice(-10);
            const newDust1Data = [...prevData.datasets[0].data, dust_sensor].slice(-10);
            const newDust2Data = [...prevData.datasets[1].data, co2_sensor].slice(-10);
            return {
                ...prevData,
                labels,
                datasets: [
                    { ...prevData.datasets[0], data: newDust1Data },
                    { ...prevData.datasets[1], data: newDust2Data },
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
                <SummaryCard
                    title="Dust Sensor"
                    value={sensorData?.dust_sensor || 0}
                    unit=""
                    status={sensorData?.dust_sensor > 500 ? "High" : "Normal"}
                    statusType={sensorData?.dust_sensor > 500 ? "high" : "normal"}
                />
                <SummaryCard
                    title="CO2 Sensor"
                    value={sensorData?.co2_sensor || 0}
                    unit=""
                    status={sensorData?.co2_sensor > 50 ? "High" : "Normal"}
                    statusType={sensorData?.co2_sensor > 50 ? "high" : "normal"}
                />
            </div>

            <div className={styles.chartsContainer}>
                <div className={styles.chartCard}>
                    <h3>Environmental Parameters</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Dust & CO2 Sensors</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptionsDust} data={chartDataDust} />
                    </div>
                </div>
            </div>

            <DeviceControls
                ledStatus={ledStatus}
                sendCommand={sendCommand}
                isEsp32DataConnected={isEsp32DataConnected}
                deviceLoading={deviceLoading}
                isAlarmOn={isAlarmOn}
            />
        </div>
    );
}
export default Dashboard;