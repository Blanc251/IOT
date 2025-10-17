import express from 'express';

const router = express.Router();

export default (db, client, COMMAND_TOPIC, isEsp32DataConnected) => {
    router.post('/', async (req, res) => {
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
                const sql = 'INSERT INTO action_logs (device, action) VALUES (?, ?)';
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

    return router;
};