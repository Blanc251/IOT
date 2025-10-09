import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';

/* --- Server Setup --- */
const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

/* --- In-memory Data Storage --- */
let latestSensorData = {};
let latestLedStatus = {};
/* An array is added to store historical sensor data. */
let historicalData = [];

/*
  A function is defined to generate mock historical data.
  This ensures the UI is populated on first load.
*/
function generateMockData() {
    for (let i = 124; i > 0; i--) {
        const timestamp = new Date(Date.now() - i * 5 * 60000);
        const dateStr = `${timestamp.getDate().toString().padStart(2, '0')}/${(timestamp.getMonth() + 1).toString().padStart(2, '0')}/${timestamp.getFullYear()}`;
        const timeStr = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
        historicalData.push({
            id: 18625 + (124 - i),
            temperature: (25 + Math.random() * 2).toFixed(1),
            humidity: Math.floor(35 + Math.random() * 20),
            light: Math.floor(800 + Math.random() * 400),
            time: `${dateStr} ${timeStr}`
        });
    }
}
generateMockData();

/* --- MQTT Client Setup --- */
const mqttBrokerUrl = 'mqtt://172.20.10.2:1883';
const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345'
});

const SENSOR_TOPIC = "iot/sensor/data";
const COMMAND_TOPIC = "iot/led/control";
const STATUS_TOPIC = "iot/led/status";

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');
    client.subscribe([SENSOR_TOPIC, STATUS_TOPIC], (err) => {
        if (!err) {
            console.log(`📡 Subscribed to topics: ${SENSOR_TOPIC} & ${STATUS_TOPIC}`);
        }
    });
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    if (topic === SENSOR_TOPIC) {
        console.log('Received sensor data:', data);
        latestSensorData = data;

        /* New sensor data is added to the beginning of the history array. */
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newRecord = {
            id: 18625 + historicalData.length,
            ...data,
            time: `${dateStr} ${timeStr}`
        };
        historicalData.unshift(newRecord);
    }
    if (topic === STATUS_TOPIC) {
        console.log('Received LED status:', data);
        latestLedStatus = data;
    }
});

/* --- API Endpoints --- */
app.get('/api/data', (req, res) => {
    res.json({
        sensors: latestSensorData,
        leds: latestLedStatus
    });
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
        console.log(`✅ Command sent to ${COMMAND_TOPIC}:`, command);
        res.status(200).send('Command sent successfully');
    });
});

/* A new GET endpoint is added for fetching historical data with pagination. */
app.get('/api/data/history', (req, res) => {
    const page = parseInt(req.query.page || 1);
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
        totalItems: historicalData.length,
        totalPages: Math.ceil(historicalData.length / limit),
        currentPage: page,
        data: historicalData.slice(startIndex, endIndex)
    };

    res.json(results);
});


/* --- Start the Server --- */
app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:${port}`);
});