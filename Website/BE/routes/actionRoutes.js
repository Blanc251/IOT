import express from 'express';

const router = express.Router();

export default (db) => {
    router.get('/history', async (req, res) => {
        try {
            const [actions] = await db.query('SELECT * FROM action_logs ORDER BY created_at DESC');
            res.json(actions);
        } catch (error) {
            console.error('Error fetching action history:', error.message);
            res.status(500).json({ error: 'Failed to fetch action history' });
        }
    });

    return router;
};