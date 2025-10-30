import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';
import mysql from 'mysql2/promise';
import http from 'http';
import { WebSocketServer } from 'ws';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import dataRoutes from './routes/dataRoutes.js';
import commandRoutes from './routes/commandRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import statusRoutes from './routes/statusRoutes.js';

const app = express();
const port = 3001;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let isMqttConnected = false;
let isEsp32DataConnected = false;
let currentLedStatus = { led1: 'off', led2: 'off', led3: 'off' };
let currentSensorData = {};

function broadcastToAll(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function broadcastMqttStatus() {
    broadcastToAll({ type: 'MQTT_STATUS', isConnected: isMqttConnected });
}

function broadcastDataStatus() {
    broadcastToAll({ type: 'DATA_STATUS', isConnected: isEsp32DataConnected });
}

function broadcastSensorData(data) {
    broadcastToAll({ type: 'SENSOR_DATA', data });
}

function broadcastLedStatus(status) {
    broadcastToAll({ type: 'LED_STATUS', data: status });
}

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'MQTT_STATUS', isConnected: isMqttConnected }));
    ws.send(JSON.stringify({ type: 'DATA_STATUS', isConnected: isEsp32DataConnected }));
    ws.send(JSON.stringify({ type: 'LED_STATUS', data: currentLedStatus }));
    ws.send(JSON.stringify({ type: 'SENSOR_DATA', data: currentSensorData }));
});

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'iot_dashboard',
};

const mqttBrokerUrl = 'mqtt://172.17.118.87:1883';
const SENSOR_TOPIC = 'iot/sensor/data';
const COMMAND_TOPIC = 'iot/led/control';
const STATUS_TOPIC = 'iot/led/status';
const ESP32_STATUS_TOPIC = 'iot/esp32/status';

const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345',
    keepalive: 10,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
});

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'IOT Dashboard API',
            version: '1.0.0',
            description: 'API documentation for the IOT Dashboard',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

async function startServer() {
    let db;
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL Database');
    } catch (error) {
        console.error('DATABASE CONNECTION FAILED:', error);
        process.exit(1);
    }

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        isMqttConnected = true;
        broadcastMqttStatus();
        client.subscribe([SENSOR_TOPIC, STATUS_TOPIC, ESP32_STATUS_TOPIC], (err) => {
            if (!err) {
                console.log('Subscribed to topics:', SENSOR_TOPIC, STATUS_TOPIC, ESP32_STATUS_TOPIC);
            }
        });
    });

    client.on('reconnect', () => {
        console.log('Reconnecting to MQTT Broker...');
        isMqttConnected = false;
        broadcastMqttStatus();
    });

    client.on('close', () => {
        console.log('Disconnected from MQTT Broker');
        isMqttConnected = false;
        broadcastMqttStatus();
    });

    client.on('offline', () => {
        console.log('MQTT client is offline');
        isMqttConnected = false;
        broadcastMqttStatus();
    });

    client.on('error', (error) => {
        console.error('MQTT Connection Error:', error);
        isMqttConnected = false;
        broadcastMqttStatus();
        client.end();
    });

    client.on('message', async (topic, message) => {

        if (topic === ESP32_STATUS_TOPIC) {
            const status = message.toString();
            const newConnectionState = (status === 'online');

            if (isEsp32DataConnected !== newConnectionState) {
                isEsp32DataConnected = newConnectionState;
                console.log(`ESP32 Connection status changed: ${status}`);
                broadcastDataStatus();
            }
        }

        if (topic === SENSOR_TOPIC) {
            const data = JSON.parse(message.toString());
            currentSensorData = data;
            broadcastSensorData(data);
            try {
                const sql = 'INSERT INTO sensor_readings (temperature, humidity, light) VALUES (?, ?, ?)';
                await db.query(sql, [data.temperature, data.humidity, data.light]);
            } catch (error) {
                console.error('Failed to save sensor data:', error.message);
            }
        }

        if (topic === STATUS_TOPIC) {
            const data = JSON.parse(message.toString());
            currentLedStatus = { ...currentLedStatus, ...data };
            broadcastLedStatus(currentLedStatus);
        }
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use('/api/data', dataRoutes(db, currentLedStatus));
    app.use('/api/command', commandRoutes(db, client, COMMAND_TOPIC, () => isEsp32DataConnected));
    app.use('/api/actions', actionRoutes(db));
    app.use('/api', statusRoutes(() => isMqttConnected, () => isEsp32DataConnected));

    server.listen(port, () => {
        console.log(`Backend server running at http://localhost:${port}`);
        console.log(`API docs available at http://localhost:${port}/api-docs`);
    });
}

startServer();