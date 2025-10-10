import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ActionHistory.module.css';

const API_URL = 'http://localhost:3001/api';

function ActionHistory() {
    const [actions, setActions] = useState([]);
    const [filteredActions, setFilteredActions] = useState([]);
    const [actionFilter, setActionFilter] = useState('ALL');
    const [deviceFilter, setDeviceFilter] = useState('ALL');

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const response = await axios.get(`${API_URL}/actions/history`);
                setActions(response.data);
            } catch (error) {
                console.error("Error fetching action history:", error);
            }
        };
        fetchActions();
    }, []);

    useEffect(() => {
        let result = actions;

        if (actionFilter !== 'ALL') {
            result = result.filter(a => a.action === actionFilter);
        }

        if (deviceFilter !== 'ALL') {
            result = result.filter(a => a.device === deviceFilter);
        }

        setFilteredActions(result);
    }, [actions, actionFilter, deviceFilter]);


    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1>Action History</h1>
            </div>

            <div className={styles.filterBar}>
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
                    <option value="ALL">ALL Actions</option>
                    <option value="ON">ON</option>
                    <option value="OFF">OFF</option>
                </select>
                <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)}>
                    <option value="ALL">ALL Devices</option>
                    <option value="LED">LED</option>
                    <option value="FAN">FAN</option>
                    <option value="AIR_CONDITIONER">AIR_CONDITIONER</option>
                </select>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Device</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActions.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.device}</td>
                                <td>
                                    <span className={`${styles.actionBadge} ${record.action === 'ON' ? styles.on : styles.off}`}>
                                        {record.action}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <span>Hiển thị {filteredActions.length} trong số {actions.length} thiết bị hoạt động gần đây</span>
            </div>
        </div>
    );
}

export default ActionHistory;