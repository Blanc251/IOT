import express from 'express';

const router = express.Router();

export default (isMqttConnected, isEsp32DataConnected) => {
    /**
     * @swagger
     * /api/mqtt-status:
     *   get:
     *     summary: Kiểm tra trạng thái kết nối
     *     tags: [Trạng thái]
     *     description: Lấy trạng thái kết nối hiện tại của MQTT Broker và thiết bị ESP32.
     *     responses:
     *       '200':
     *         description: Trả về trạng thái kết nối thành công.
     */
    router.get('/mqtt-status', (req, res) => {
        res.json({ isConnected: isMqttConnected(), isEsp32DataConnected: isEsp32DataConnected() });
    });
    return router;
};