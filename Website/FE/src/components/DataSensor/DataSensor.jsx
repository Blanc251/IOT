import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const API_URL = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 9; // Đã thay đổi từ 10 thành 9

const searchPlaceholders = {
    all: 'Search by ID, Temp, Humidity, Light, or Time',
    created_at: 'Search by date/time (dd/mm/yyyy, hh:ii:ss)',
    temperature: 'Search by Temperature',
    humidity: 'Search by Humidity',
    light: 'Search by Light',
    dust_sensor: 'Search by Dust Sensor',
    co2_sensor: 'Search by CO2 Sensor'
};

function DataSensor({ isEsp32DataConnected }) {
    const [history, setHistory] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsRange, setItemsRange] = useState({ start: 0, end: 0 });

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortConfig, setSortConfig] = useState({
        key: searchParams.get('sortKey') || 'created_at',
        direction: searchParams.get('sortDirection') || 'descending'
    });

    const fetchHistory = useCallback(async () => {
        try {
            const page = parseInt(searchParams.get('page') || '1', 10);
            const search = searchParams.get('search') || '';
            const sortKey = searchParams.get('sortKey') || 'created_at';
            const sortDirection = searchParams.get('sortDirection') || 'descending';

            const response = await axios.get(`${API_URL}/data/history`, {
                params: {
                    page: page,
                    limit: ITEMS_PER_PAGE,
                    search: search,
                    sortKey: sortKey,
                    sortDirection: sortDirection,
                }
            });
            const { data, totalPages, totalItems } = response.data;
            setHistory(data);
            setTotalPages(totalPages);
            setTotalItems(totalItems);

            const start = (page - 1) * ITEMS_PER_PAGE + 1;
            const end = start + data.length - 1;
            setItemsRange({ start, end });
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setHistory([]);
            setTotalPages(0);
            setTotalItems(0);
            setItemsRange({ start: 0, end: 0 });
        }
    }, [searchParams]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        const newSearchParams = new URLSearchParams(searchParams);

        newSearchParams.set('search', searchTerm.trim());
        newSearchParams.set('sortKey', sortConfig.key);
        newSearchParams.set('sortDirection', sortConfig.direction);

        if (parseInt(searchParams.get('page') || '1', 10) !== 1) {
            newSearchParams.set('page', '1');
        }

        setSearchParams(newSearchParams, { replace: true });
    }, [debouncedSearchTerm, sortConfig]);

    const handlePageChange = (newPage) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', newPage.toString());
        setSearchParams(newSearchParams);
    };

    const getFormattedDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-GB', { hour12: false });
    };

    const handleCopyClick = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <h1>Data Sensor</h1>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchBar}>
                    <BsSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={searchPlaceholders[sortConfig.key] || 'Search...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={sortConfig.key} onChange={e => setSortConfig({ ...sortConfig, key: e.target.value })}>
                    <option value="all">All</option>
                    <option value="created_at">Sort by Time</option>
                    <option value="temperature">Sort by Temperature</option>
                    <option value="humidity">Sort by Humidity</option>
                    <option value="light">Sort by Light</option>
                    <option value="dust_sensor">Sort by Dust Sensor</option>
                    <option value="co2_sensor">Sort by CO2 Sensor</option>
                </select>
                <select value={sortConfig.direction} onChange={e => setSortConfig({ ...sortConfig, direction: e.target.value })}>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Temperature (°C)</th>
                            <th>Humidity (%)</th>
                            <th>Light (nits)</th>
                            <th>Dust Sensor</th>
                            <th>CO2 Sensor</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? history.map(record => {
                            const formattedDate = getFormattedDate(record.created_at);
                            return (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.temperature}</td>
                                    <td>{record.humidity}</td>
                                    <td>{record.light}</td>
                                    <td>{record.dust_sensor}</td>
                                    <td>{record.co2_sensor}</td>
                                    <td
                                        className={styles.timeCell}
                                        onClick={() => handleCopyClick(formattedDate)}
                                        title="Click to copy"
                                    >
                                        {formattedDate}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-text-color)' }}>
                                    {isEsp32DataConnected ? 'No data found' : 'No data found (device may be disconnected)'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <span>
                    {totalItems > 0
                        ? `Displaying ${itemsRange.start}-${itemsRange.end} of ${totalItems} results`
                        : 'No data available.'}
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