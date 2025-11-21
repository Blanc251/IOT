import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import { BsSearch } from 'react-icons/bs';
import styles from './ActionHistory.module.css';

const API_URL = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 9; // Đã thay đổi từ 10 thành 9

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

const searchPlaceholder = 'Search by date/time (dd/mm/yyyy, hh:ii:ss)';

function ActionHistory({ isEsp32DataConnected }) {
    const [actions, setActions] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsRange, setItemsRange] = useState({ start: 0, end: 0 });

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filterDevice, setFilterDevice] = useState(searchParams.get('device') || 'all');
    const [filterAction, setFilterAction] = useState(searchParams.get('action') || 'all');
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'descending'
    });

    const fetchActions = useCallback(async () => {
        try {
            const page = parseInt(searchParams.get('page') || '1', 10);
            const search = searchParams.get('search') || '';
            const device = searchParams.get('device') || 'all';
            const action = searchParams.get('action') || 'all';
            const sortKey = sortConfig.key;
            const sortDirection = sortConfig.direction;

            const response = await axios.get(`${API_URL}/actions/history`, {
                params: {
                    page: page,
                    limit: ITEMS_PER_PAGE,
                    search: search,
                    device: device,
                    action: action,
                    sortKey: sortKey,
                    sortDirection: sortDirection,
                }
            });

            const { data, totalPages, totalItems } = response.data;
            setActions(data);
            setTotalPages(totalPages);
            setTotalItems(totalItems);

            const start = (page - 1) * ITEMS_PER_PAGE + 1;
            const end = start + data.length - 1;
            setItemsRange({ start, end: end < start ? start : end });
        } catch (error) {
            console.error("Error fetching action history:", error);
            setActions([]);
            setTotalPages(0);
            setTotalItems(0);
            setItemsRange({ start: 0, end: 0 });
        }
    }, [searchParams, sortConfig]);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    useEffect(() => {
        const newSearchParams = new URLSearchParams(searchParams);

        newSearchParams.set('search', searchTerm.trim());
        newSearchParams.set('device', filterDevice);
        newSearchParams.set('action', filterAction);
        newSearchParams.set('sortKey', sortConfig.key);
        newSearchParams.set('sortDirection', sortConfig.direction);

        if (parseInt(searchParams.get('page') || '1', 10) !== 1) {
            newSearchParams.set('page', '1');
        }

        setSearchParams(newSearchParams, { replace: true });

    }, [debouncedSearchTerm, filterDevice, filterAction, sortConfig]);

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
            <div className={styles.header}>
                <h1>Action History</h1>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchBar}>
                    <BsSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterDevice} onChange={e => setFilterDevice(e.target.value)}>
                    <option value="all">All Devices</option>
                    <option value="FAN">FAN</option>
                    <option value="AIR_CONDITIONER">AIR_CONDITIONER</option>
                    <option value="LED">LED</option>
                </select>

                <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                    <option value="all">All Actions</option>
                    <option value="ON">ON</option>
                    <option value="OFF">OFF</option>
                </select>
            </div>

            <div className={styles.tableCard}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Device</th>
                            <th>Action</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.length > 0 ? actions.map(record => {
                            const formattedDate = getFormattedDate(record.created_at);
                            return (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.device}</td>
                                    <td>
                                        <span className={`${styles.actionBadge} ${record.action === 'ON' ? styles.on : styles.off}`}>
                                            {record.action}
                                        </span>
                                    </td>
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
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-text-color)' }}>
                                    No action history found.
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

export default ActionHistory;