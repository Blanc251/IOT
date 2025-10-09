import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';

// --- Server Setup ---
const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

// --- In-memory Data Storage ---
let latestSensorData = {};
let latestLedStatus = {};

// --- MQTT Client Setup ---
const mqttBrokerUrl = 'mqtt://172.20.10.2:1883';
const client = mqtt.connect(mqttBrokerUrl, {
    username: 'vui',
    password: '12345'
});

// Define MQTT topics
const SENSOR_TOPIC = "iot/sensor/data";
const COMMAND_TOPIC = "iot/led/control";
const STATUS_TOPIC = "iot/led/status";

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');
    // Subscribe to both sensor data and LED status topics
    client.subscribe([SENSOR_TOPIC, STATUS_TOPIC], (err) => {
        if (!err) {
            console.log(`📡 Subscribed to topics: ${SENSOR_TOPIC} & ${STATUS_TOPIC}`);
        }
    });
});

// Handle incoming messages from the ESP32
client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === SENSOR_TOPIC) {
        console.log('Received sensor data:', data);
        latestSensorData = data;
    }

    if (topic === STATUS_TOPIC) {
        console.log('Received LED status:', data);
        latestLedStatus = data;
    }
});

// --- API Endpoints ---

// GET endpoint to provide all current data to the frontend
app.get('/api/data', (req, res) => {
    res.json({
        sensors: latestSensorData,
        leds: latestLedStatus
    });
});

// POST endpoint to receive a command string from the frontend
app.post('/api/command', (req, res) => {
    const { command } = req.body; // Expects a simple string like "led1on"

    if (!command) {
        return res.status(400).send('Command string is required');
    }

    // Publish the exact command string to the control topic
    client.publish(COMMAND_TOPIC, command, (err) => {
        if (err) {
            console.error('Failed to publish command:', err);
            return res.status(500).send('Failed to send command');
        }
        console.log(`✅ Command sent to ${COMMAND_TOPIC}:`, command);
        res.status(200).send('Command sent successfully');
    });
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:${port}`);
});