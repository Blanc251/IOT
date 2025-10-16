import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import styles from './ActionHistory.module.css';

const API_URL = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 10;

function ActionHistory({ isEsp32DataConnected }) {
    const [actions, setActions] = useState([]);
    const [filteredActions, setFilteredActions] = useState([]);
    const [actionFilter, setActionFilter] = useState('ALL');
    const [deviceFilter, setDeviceFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!isEsp32DataConnected) {
            setActions([]);
            setFilteredActions([]);
            setCurrentPage(1);
            return;
        }

        const fetchActions = async () => {
            try {
                const response = await axios.get(`${API_URL}/actions/history`);
                setActions(response.data);
            } catch (error) {
                console.error("Error fetching action history:", error);
            }
        };
        fetchActions();
    }, [isEsp32DataConnected]);

    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredActions];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'created_at') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredActions, sortConfig]);


    useEffect(() => {
        if (!isEsp32DataConnected) return;

        let result = actions;

        if (actionFilter !== 'ALL') {
            result = result.filter(a => a.action === actionFilter);
        }

        if (deviceFilter !== 'ALL') {
            result = result.filter(a => a.device === deviceFilter);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            result = result.filter(a => {
                const timeString = new Date(a.created_at)
                    .toLocaleString('en-GB', { hour12: false })
                    .toLowerCase();
                const idString = a.id.toString();

                return timeString.includes(lowercasedQuery) || idString.includes(lowercasedQuery);
            });
        }

        setFilteredActions(result);
        setCurrentPage(1);
    }, [actions, actionFilter, deviceFilter, searchQuery, isEsp32DataConnected]);

    const handleSortChange = (e) => {
        setSortConfig(prevConfig => ({ ...prevConfig, key: e.target.value }));
    };

    const handleDirectionChange = (e) => {
        setSortConfig(prevConfig => ({ ...prevConfig, direction: e.target.value }));
    };

    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
    const startItem = sortedItems.length > 0 ? indexOfFirstItem + 1 : 0;
    const endItem = Math.min(indexOfLastItem, sortedItems.length);


    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1>Action History</h1>
            </div>

            <div className={styles.filterBar}>
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} disabled={!isEsp32DataConnected}>
                    <option value="ALL">ALL Actions</option>
                    <option value="ON">ON</option>
                    <option value="OFF">OFF</option>
                </select>
                <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)} disabled={!isEsp32DataConnected}>
                    <option value="ALL">ALL Devices</option>
                    <option value="LED">LED</option>
                    <option value="FAN">FAN</option>
                    <option value="AIR_CONDITIONER">AIR_CONDITIONER</option>
                </select>
                <input
                    type="text"
                    placeholder="Search by ID, date, or time..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    disabled={!isEsp32DataConnected}
                />
                <select value={sortConfig.key} onChange={handleSortChange} disabled={!isEsp32DataConnected}>
                    <option value="id">Sort by ID</option>
                    <option value="created_at">Sort by Time</option>
                </select>
                <select value={sortConfig.direction} onChange={handleDirectionChange} disabled={!isEsp32DataConnected}>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
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
                        {currentItems.map(record => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                {/* Updated message */}
                <span>{isEsp32DataConnected ? `Hiển thị ${startItem}-${endItem} của ${sortedItems.length} kết quả` : 'Thiết bị đang ngắt kết nối. Vui lòng kết nối thiết bị để xem lịch sử.'}</span>
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