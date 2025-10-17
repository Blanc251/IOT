import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import { BsSearch } from 'react-icons/bs';
import styles from './DataSensor.module.css';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const formatSearchTerm = (term) => {
    return term.trim();
};

const API_URL = 'http://localhost:3001/api';

function DataSensor({ isEsp32DataConnected }) {
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsRange, setItemsRange] = useState({ start: 0, end: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });

    const fetchHistory = useCallback(async () => {
        if (!isEsp32DataConnected) {
            setHistory([]);
            setTotalPages(0);
            setTotalItems(0);
            setItemsRange({ start: 0, end: 0 });
            return;
        }

        try {
            const formattedSearch = formatSearchTerm(debouncedSearchTerm);
            const response = await axios.get(`${API_URL}/data/history`, {
                params: {
                    page: currentPage,
                    search: formattedSearch,
                    sortKey: sortConfig.key,
                    sortDirection: sortConfig.direction,
                }
            });
            const { data, totalPages, totalItems } = response.data;
            setHistory(data);
            setTotalPages(totalPages);
            setTotalItems(totalItems);

            const start = (currentPage - 1) * 10 + 1;
            const end = start + data.length - 1;
            setItemsRange({ start, end });
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }, [currentPage, debouncedSearchTerm, isEsp32DataConnected, sortConfig]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, sortConfig]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getFormattedDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-GB', { hour12: false });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <h1>Data Sensor</h1>
            </div>

            <div className={styles.controlsBar}>
                <div className={styles.searchBar}>
                    <BsSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by date (DD/MM/YYYY) or time (HH:mm)"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        disabled={!isEsp32DataConnected}
                    />
                </div>
                <div className={styles.sortControls}>
                    <select value={sortConfig.key} onChange={e => setSortConfig({ ...sortConfig, key: e.target.value })} disabled={!isEsp32DataConnected}>
                        <option value="created_at">Sort by Time</option>
                        <option value="id">Sort by ID</option>
                        <option value="temperature">Sort by Temperature</option>
                        <option value="humidity">Sort by Humidity</option>
                        <option value="light">Sort by Light</option>
                    </select>
                    <select value={sortConfig.direction} onChange={e => setSortConfig({ ...sortConfig, direction: e.target.value })} disabled={!isEsp32DataConnected}>
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Temperature (°C)</th>
                            <th>Humidity (%)</th>
                            <th>Light (nits)</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? history.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.temperature}</td>
                                <td>{record.humidity}</td>
                                <td>{record.light}</td>
                                <td>{getFormattedDate(record.created_at)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-text-color)' }}>
                                    {isEsp32DataConnected ? 'No data found' : 'Device disconnected. Connect the device to view history.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationFooter}>
                <span>
                    {isEsp32DataConnected && totalItems > 0
                        ? `Displaying ${itemsRange.start}-${itemsRange.end} of ${totalItems} results`
                        : (isEsp32DataConnected ? 'No data available.' : 'Device disconnected. Connect the device to view history.')}
                </span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default DataSensor;