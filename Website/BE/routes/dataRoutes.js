import express from 'express';

const router = express.Router();

export default (db, currentLedStatus) => {
    router.get('/', async (req, res) => {
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

    router.get('/history', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            let searchClause = '';
            let values = [];

            if (search) {
                searchClause = 'WHERE created_at LIKE ?';
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

    return router;
};