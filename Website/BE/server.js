import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';
import mysql from 'mysql2/promise';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3001;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let isMqttConnected = false;
let isEsp32DataConnected = false;
let lastDataTimestamp = 0;
const DATA_TIMEOUT = 10000; // 10 seconds timeout for data connection

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'MQTT_STATUS', isConnected: isMqttConnected }));
    ws.send(JSON.stringify({ type: 'DATA_STATUS', isConnected: isEsp32DataConnected }));
});

function broadcastMqttStatus() {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: 'MQTT_STATUS', isConnected: isMqttConnected }));
        }
    });
}

function broadcastDataStatus() {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: 'DATA_STATUS', isConnected: isEsp32DataConnected }));
        }
    });
}

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'iot_dashboard',
};

let db;

(async function connectToDb() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL Database');
    } catch (error) {
        console.error('DATABASE CONNECTION FAILED:', error);
        process.exit(1);
    }
})();

const mqttBrokerUrl = 'mqtt://192.168.1.38:1883';
const SENSOR_TOPIC = 'iot/sensor/data';
const COMMAND_TOPIC = 'iot/led/control';
const STATUS_TOPIC = 'iot/led/status';

let currentLedStatus = { led1: 'off', led2: 'off', led3: 'off' };

const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345',
    keepalive: 120,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
});

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    isMqttConnected = true;
    broadcastMqttStatus();
    client.subscribe([SENSOR_TOPIC, STATUS_TOPIC], (err) => {
        if (!err) {
            console.log('Subscribed to topics:', SENSOR_TOPIC, STATUS_TOPIC);
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

client.on('error', (error) => {
    console.error('MQTT Connection Error:', error);
    isMqttConnected = false;
    broadcastMqttStatus();
    client.end();
});

function checkDataConnection() {
    const timeSinceLastData = Date.now() - lastDataTimestamp;
    const currentlyConnected = timeSinceLastData < DATA_TIMEOUT;

    if (isEsp32DataConnected !== currentlyConnected) {
        isEsp32DataConnected = currentlyConnected;
        console.log(`ESP32 Data Connection status changed: ${isEsp32DataConnected ? 'Connected' : 'Disconnected'}`);
        broadcastDataStatus();
    }
}

setInterval(checkDataConnection, 5000);

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === SENSOR_TOPIC) {
        lastDataTimestamp = Date.now();
        if (!isEsp32DataConnected) {
            isEsp32DataConnected = true;
            broadcastDataStatus();
        }

        try {
            const sql = `INSERT INTO sensor_readings (temperature, humidity, light) VALUES (?, ?, ?)`;
            await db.query(sql, [data.temperature, data.humidity, data.light]);
        } catch (error) {
            console.error('Failed to save sensor data:', error.message);
        }
    }

    if (topic === STATUS_TOPIC) {
        if (data?.led && ['on', 'off'].includes(data.status)) {
            if (currentLedStatus.hasOwnProperty(data.led)) {
                currentLedStatus[data.led] = data.status;
            }
        }
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1');
        res.json({
            sensors: rows[0] || {},
            leds: currentLedStatus,
        });
    } catch (error) {
        console.error('Error fetching real-time data:', error.message);
        res.status(500).json({ error: 'Failed to fetch real-time data' });
    }
});

app.get('/api/mqtt-status', (req, res) => {
    res.json({ isConnected: isMqttConnected, isEsp32DataConnected: isEsp32DataConnected });
});

app.post('/api/command', async (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    if (!isEsp32DataConnected) {
        return res.status(503).json({ error: 'Device is disconnected. Cannot send command.' });
    }

    let device = null;
    let action = null;

    if (command === 'allon' || command === 'alloff') {
        device = 'ALL_DEVICES';
        action = command === 'allon' ? 'ON' : 'OFF';
    } else {
        const led = command.slice(0, 4);
        const state = command.slice(4).toUpperCase();

        device = {
            led1: 'FAN',
            led2: 'AIR_CONDITIONER',
            led3: 'LED',
        }[led];

        action = state;
    }

    if (device && action) {
        try {
            const sql = `INSERT INTO action_logs (device, action) VALUES (?, ?)`;
            await db.query(sql, [device, action]);
            console.log(`Action logged: ${device} -> ${action}`);
        } catch (error) {
            console.error('Failed to log action:', error.message);
        }
    }

    client.publish(COMMAND_TOPIC, command, (err) => {
        if (err) {
            console.error('MQTT publish error:', err.message);
            return res.status(500).json({ error: 'Failed to send command (MQTT Broker issue)' });
        }

        console.log(`Sent command via MQTT: ${command}`);
        return res.status(200).send('Command sent successfully');
    });
});

app.get('/api/data/history', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let searchClause = '';
        let values = [];

        if (search) {
            searchClause = `WHERE created_at LIKE ?`;
            values.push(`%${search}%`);
        }

        const countSql = `SELECT COUNT(*) AS totalItems FROM sensor_readings ${searchClause}`;
        const [[{ totalItems }]] = await db.query(countSql, values);

        const totalPages = Math.ceil(totalItems / limit);

        const dataSql = `
      SELECT * FROM sensor_readings
      ${searchClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

        values.push(limit, offset);
        const [data] = await db.query(dataSql, values);

        res.json({
            totalItems,
            totalPages,
            currentPage: page,
            data,
        });
    } catch (error) {
        console.error('Error fetching history:', error.message);
        res.status(500).json({ error: 'Failed to fetch sensor history' });
    }
});

app.get('/api/actions/history', async (req, res) => {
    try {
        const [actions] = await db.query('SELECT * FROM action_logs ORDER BY created_at DESC');
        res.json(actions);
    } catch (error) {
        console.error('Error fetching action history:', error.message);
        res.status(500).json({ error: 'Failed to fetch action history' });
    }
});

server.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});