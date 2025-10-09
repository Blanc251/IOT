import React, { useState, useEffect } from 'react';
import styles from './ActionHistory.module.css';

const mockActions = [
    { id: 90, device: 'LED', action: 'OFF', time: '16/10/2024 14:53' },
    { id: 91, device: 'AIR_CONDITIONER', action: 'OFF', time: '16/10/2024 14:39' },
    { id: 92, device: 'LED', action: 'OFF', time: '16/10/2024 14:30' },
    { id: 93, device: 'AIR_CONDITIONER', action: 'OFF', time: '16/10/2024 14:07' },
    { id: 94, device: 'AIR_CONDITIONER', action: 'ON', time: '16/10/2024 13:59' },
    { id: 95, device: 'AIR_CONDITIONER', action: 'ON', time: '16/10/2024 13:38' },
    { id: 96, device: 'FAN', action: 'OFF', time: '16/10/2024 13:27' },
    { id: 97, device: 'FAN', action: 'ON', time: '16/10/2024 13:10' },
    { id: 98, device: 'FAN', action: 'ON', time: '16/10/2024 12:56' },
    { id: 99, device: 'AIR_CONDITIONER', action: 'ON', time: '16/10/2024 12:44' },
];

function ActionHistory() {
    const [actions, setActions] = useState([]);

    useEffect(() => {
        setActions(mockActions);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1>Action History</h1>
            </div>

            <div className={styles.filterBar}>
                <select>
                    <option>ALL</option>
                    <option>ON</option>
                    <option>OFF</option>
                </select>
                <select>
                    <option>Tìm thiết bị</option>
                    <option>LED</option>
                    <option>FAN</option>
                    <option>AIR_CONDITIONER</option>
                </select>
                <input type="text" placeholder="Nhập thiết bị cần tìm" />
                <button>Search</button>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Device</th>
                            <th>Hành động</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.device}</td>
                                <td>
                                    <span className={`${styles.actionBadge} ${record.action === 'ON' ? styles.on : styles.off}`}>
                                        {record.action}
                                    </span>
                                </td>
                                <td>{record.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <span>Hiển thị 10 trong số 20 thiết bị hoạt động gần đây</span>
            </div>
        </div>
    );
}

export default ActionHistory;