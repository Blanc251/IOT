import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import styles from './ActionHistory.module.css';

const API_URL = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 13;

function ActionHistory({ isEsp32DataConnected }) {
    const [actions, setActions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });


    useEffect(() => {
        const fetchActions = async () => {
            try {

                const response = await axios.get(`${API_URL}/actions/history`, {
                    params: {
                        sortKey: sortConfig.key,
                        sortDirection: sortConfig.direction,

                    }
                });
                setActions(response.data);
            } catch (error) {
                console.error("Error fetching action history:", error);
                setActions([]);
            }
        };

        fetchActions();
    }, [sortConfig]);


    const totalPages = Math.ceil(actions.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = actions.slice(indexOfFirstItem, indexOfLastItem);
    const startItem = actions.length > 0 ? indexOfFirstItem + 1 : 0;
    const endItem = Math.min(indexOfLastItem, actions.length);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1>Action History</h1>
            </div>

            <div className={styles.filterBar}>

                <select value={sortConfig.key} onChange={e => setSortConfig({ ...sortConfig, key: e.target.value })}>
                    <option value="id">Sort by ID</option>
                    <option value="created_at">Sort by Time</option>
                </select>
                <select value={sortConfig.direction} onChange={e => setSortConfig({ ...sortConfig, direction: e.target.value })}>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
            </div>

            <div className={styles.tableCard}>
                <table>

                    <tbody>
                        {currentItems.length > 0 ? currentItems.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.device}</td>
                                <td>
                                    <span className={`${styles.actionBadge} ${record.action === 'ON' ? styles.on : styles.off}`}>
                                        {record.action}
                                    </span>
                                </td>
                                <td>{new Date(record.created_at).toLocaleString('en-GB', { hour12: false })}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-text-color)' }}>
                                    No action history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <span>{`Showing ${startItem}-${endItem} of ${actions.length} results`}</span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

export default ActionHistory;