import express from 'express';

const router = express.Router();

export default (db, currentLedStatus) => {
    /**
     * @swagger
     * /api/data:
     *   get:
     *     summary: Lấy dữ liệu cảm biến mới nhất
     *     tags: [Dữ liệu]
     *     description: Truy xuất thông số cảm biến gần nhất và trạng thái hiện tại của các đèn LED.
     *     responses:
     *       '200':
     *         description: Lấy dữ liệu mới nhất thành công.
     *       '500':
     *         description: Lỗi máy chủ.
     */
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

    /**
     * @swagger
     * /api/data/history:
     *   get:
     *     summary: Lấy dữ liệu cảm biến theo trang
     *     tags: [Dữ liệu]
     *     description: Lấy danh sách dữ liệu cảm biến trong quá khứ, có hỗ trợ phân trang, sắp xếp và tìm kiếm.
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Số trang để phân trang.
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Từ khóa tìm kiếm.
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
     *         description: Một danh sách dữ liệu cảm biến đã được phân trang.
     *       '400':
     *         description: Khóa sắp xếp không hợp lệ.
     *       '500':
     *         description: Lỗi máy chủ.
     */
    router.get('/history', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            const sortKey = req.query.sortKey || 'created_at';
            const sortDirection = req.query.sortDirection === 'ascending' ? 'ASC' : 'DESC';

            const allowedSortKeys = ['id', 'temperature', 'humidity', 'light', 'created_at'];
            if (!allowedSortKeys.includes(sortKey)) {
                return res.status(400).json({ error: 'Invalid sort key' });
            }

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
                ORDER BY ${sortKey} ${sortDirection}
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