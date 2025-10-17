import express from 'express';

const router = express.Router();

export default (db) => {
    /**
     * @swagger
     * /api/actions/history:
     *   get:
     *     summary: Lấy lịch sử hành động
     *     tags: [Hành động]
     *     description: Lấy danh sách tất cả các hành động điều khiển thiết bị đã được ghi lại.
     *     parameters:
     *       - in: query
     *         name: sortKey
     *         schema:
     *           type: string
     *         description: Cột dùng để sắp xếp.
     *       - in: query
     *         name: sortDirection
     *         schema:
     *           type: string
     *           enum: [ascending, descending]
     *         description: Hướng sắp xếp.
     *     responses:
     *       '200':
     *         description: Lấy lịch sử hành động thành công.
     *       '500':
     *         description: Lỗi máy chủ.
     */
    router.get('/history', async (req, res) => {
        try {
            const sortKey = req.query.sortKey || 'id';
            const sortDirection = req.query.sortDirection === 'ascending' ? 'ASC' : 'DESC';

            const allowedSortKeys = ['id', 'device', 'action', 'created_at'];
            if (!allowedSortKeys.includes(sortKey)) {
                return res.status(400).json({ error: 'Invalid sort key' });
            }

            const sql = `SELECT * FROM action_logs ORDER BY ${sortKey} ${sortDirection}`;
            const [actions] = await db.query(sql);

            res.json(actions);
        } catch (error) {
            console.error('Error fetching action history:', error.message);
            res.status(500).json({ error: 'Failed to fetch action history' });
        }
    });

    return router;
};