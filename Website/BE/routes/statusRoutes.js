import express from 'express';

const router = express.Router();

export default (isMqttConnected, isEsp32DataConnected) => {
    router.get('/mqtt-status', (req, res) => {
        res.json({ isConnected: isMqttConnected, isEsp32DataConnected: isEsp32DataConnected });
    });
    return router;
}