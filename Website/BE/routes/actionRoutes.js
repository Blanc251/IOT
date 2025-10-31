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
            const page = parseInt(req.query.page) || 1;
            const limit = 15;
            const offset = (page - 1) * limit;

            const search = req.query.search || '';
            const filterDevice = req.query.device || 'all';
            const filterAction = req.query.action || 'all';

            const sortKey = req.query.sortKey || 'created_at';
            const sortDirection = req.query.sortDirection === 'ascending' ? 'ASC' : 'DESC';

            const allowedSortKeys = ['id', 'created_at'];
            if (!allowedSortKeys.includes(sortKey)) {
                return res.status(400).json({ error: 'Invalid sort key' });
            }

            let filterConditions = [];
            let values = [];

            if (filterDevice && filterDevice !== 'all') {
                filterConditions.push('device = ?');
                values.push(filterDevice);
            }

            if (filterAction && filterAction !== 'all') {
                filterConditions.push('action = ?');
                values.push(filterAction);
            }

            if (search) {
                filterConditions.push(`(CAST(id AS CHAR) LIKE ? OR DATE_FORMAT(created_at, '%d/%m/%Y, %H:%i:%s') LIKE ?)`);
                const searchTerm = `%${search}%`;
                values.push(searchTerm, searchTerm);
            }

            const filterClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

            const countSql = `SELECT COUNT(*) AS totalItems FROM action_logs ${filterClause}`;
            const [[{ totalItems }]] = await db.query(countSql, values);

            const totalPages = Math.ceil(totalItems / limit);

            const dataSql = `
                SELECT * FROM action_logs
                ${filterClause}
                ORDER BY ${sortKey} ${sortDirection}
                LIMIT ? OFFSET ?
            `;

            const queryValues = [...values, limit, offset];
            const [data] = await db.query(dataSql, queryValues);

            res.json({
                totalItems,
                totalPages,
                currentPage: page,
                data,
            });
        } catch (error) {
            console.error('Error fetching action history:', error.message);
            res.status(500).json({ error: 'Failed to fetch action history' });
        }
    });

    return router;
};