import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'iot_dashboard'
};

let db;
(async function connectToDb() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Successfully connected to MySQL database!');
    } catch (error) {
        console.error('DATABASE CONNECTION FAILED:', error);
        process.exit(1);
    }
})();

const mqttBrokerUrl = 'mqtt://192.168.1.21:1883';
const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345'
});

const SENSOR_TOPIC = "iot/sensor/data";
const COMMAND_TOPIC = "iot/led/control";
const STATUS_TOPIC = "iot/led/status";

let currentLedStatus = { led1: 'off', led2: 'off', led3: 'off' };

client.on('connect', () => {
    console.log('Connected to MQTT Broker!');
    client.subscribe([SENSOR_TOPIC, STATUS_TOPIC], (err) => {
        if (!err) {
            console.log(`Subscribed to topics: ${SENSOR_TOPIC} & ${STATUS_TOPIC}`);
        }
    });
});

client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === SENSOR_TOPIC) {
        try {
            const sql = 'INSERT INTO sensor_readings (temperature, humidity, light) VALUES (?, ?, ?)';
            await db.query(sql, [data.temperature, data.humidity, data.light]);
        } catch (error) {
            console.error('Failed to save sensor data:', error);
        }
    }

    if (topic === STATUS_TOPIC) {
        if (data && data.led && (data.status === 'on' || data.status === 'off')) {
            if (currentLedStatus.hasOwnProperty(data.led)) {
                currentLedStatus[data.led] = data.status;
            }
        }
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const [sensorRows] = await db.query('SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1');
        res.json({
            sensors: sensorRows[0] || {},
            leds: currentLedStatus
        });
    } catch (error) {
        console.error('API Error fetching real-time data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/command', async (req, res) => {
    const { command } = req.body;
    console.log(`Received API call to /api/command with command: "${command}"`);

    if (!command) {
        console.error('Error: Command string is required.');
        return res.status(400).send('Command string is required');
    }

    let device, action;

    if (command === 'allon' || command === 'alloff') {
        device = 'ALL_DEVICES';
        action = command === 'allon' ? 'ON' : 'OFF';
    } else {
        const ledName = command.slice(0, 4);
        const state = command.slice(4);
        if (ledName === 'led1') device = 'FAN';
        else if (ledName === 'led2') device = 'AIR_CONDITIONER';
        else if (ledName === 'led3') device = 'LED';
        action = state.toUpperCase();
    }

    if (device && action) {
        console.log(`Attempting to log to database: Device='${device}', Action='${action}'`);
        try {
            const sql = 'INSERT INTO action_logs (device, action) VALUES (?, ?)';
            const [result] = await db.query(sql, [device, action]);
            console.log(`Action logged successfully! Insert ID: ${result.insertId}`);
        } catch (error) {
            console.error('DATABASE INSERT FAILED:', error.message);
        }
    } else {
        console.warn('Could not determine device/action to log.');
    }

    client.publish(COMMAND_TOPIC, command, (err) => {
        if (err) {
            console.error('MQTT Publish Failed:', err);
            return res.status(500).send('Failed to send command');
        }
        console.log(`Command sent to MQTT topic "${COMMAND_TOPIC}":`, command);
        res.status(200).send('Command sent successfully');
    });
});

app.get('/api/actions/history', async (req, res) => {
    console.log(`Received API call to /api/actions/history`);
    try {
        const query = 'SELECT * FROM action_logs ORDER BY created_at DESC';
        console.log('Executing SQL Query:', query);
        const [actions] = await db.query(query);
        console.log(`Found ${actions.length} records in action_logs.`);
        res.json(actions);
    } catch (error) {
        console.error('DATABASE SELECT FAILED:', error.message);
        res.status(500).json({ error: 'Failed to fetch action history' });
    }
});

app.get('/api/data/history', async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1);
        const limit = 10;
        const offset = (page - 1) * limit;
        const [[{ totalItems }]] = await db.query('SELECT COUNT(*) as totalItems FROM sensor_readings');
        const totalPages = Math.ceil(totalItems / limit);
        const [data] = await db.query('SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ totalItems, totalPages, currentPage: page, data });
    } catch (error) {
        console.error('API Error fetching sensor history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});