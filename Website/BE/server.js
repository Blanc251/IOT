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
        console.log('Connected to MySQL database!');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
})();

const mqttBrokerUrl = 'mqtt://172.20.10.2:1883';
const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345'
});

const SENSOR_TOPIC = "iot/sensor/data";
const COMMAND_TOPIC = "iot/led/control";
const STATUS_TOPIC = "iot/led/status";

// 1. Add a variable to store the current LED status
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
        console.log('Received sensor data:', data);
        try {
            const sql = 'INSERT INTO sensor_readings (temperature, humidity, light) VALUES (?, ?, ?)';
            await db.query(sql, [data.temperature, data.humidity, data.light]);
            console.log('Sensor data saved to database.');
        } catch (error) {
            console.error('Failed to save sensor data:', error);
        }
    }

    // 2. Update the status when a message is received from the device
    if (topic === STATUS_TOPIC) {
        console.log('Received LED status:', data);
        if (data && data.led && (data.status === 'on' || data.status === 'off')) {
            if (currentLedStatus.hasOwnProperty(data.led)) {
                currentLedStatus[data.led] = data.status;
                console.log(`Updated server state: ${data.led} is now ${data.status}`);
            }
        }
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const [sensorRows] = await db.query('SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1');

        // 3. Send the REAL currentLedStatus to the front-end
        res.json({
            sensors: sensorRows[0] || {},
            leds: currentLedStatus
        });
    } catch (error) {
        console.error('API Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/command', (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).send('Command string is required');
    }
    client.publish(COMMAND_TOPIC, command, (err) => {
        if (err) {
            console.error('Failed to publish command:', err);
            return res.status(500).send('Failed to send command');
        }
        console.log(`Command sent to ${COMMAND_TOPIC}:`, command);
        res.status(200).send('Command sent successfully');
    });
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
        console.error('API Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});