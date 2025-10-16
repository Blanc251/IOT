import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import { BsSearch } from 'react-icons/bs';
import styles from './DataSensor.module.css';

const API_URL = 'http://localhost:3001/api';

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

function DataSensor({ isEsp32DataConnected }) {
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsRange, setItemsRange] = useState({ start: 0, end: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const formatSearchTerm = (term) => {
        term = term.trim();
        if (!term) return '';

        // DD/MM/YYYY → YYYY-MM-DD
        if (term.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const [day, month, year] = term.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // DD/MM → assume current year
        if (term.match(/^\d{1,2}\/\d{1,2}$/)) {
            const [day, month] = term.split('/');
            const year = new Date().getFullYear();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Already in YYYY-MM-DD
        if (term.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return term;
        }

        // HH:mm time filtering
        if (term.includes(':')) {
            return term;
        }

        return term;
    };

    useEffect(() => {
        // Chỉ cần thoát (return) nếu không kết nối, không cần xóa dữ liệu
        if (!isEsp32DataConnected) {
            return;
        }

        const fetchHistory = async () => {
            try {
                const formattedSearch = formatSearchTerm(debouncedSearchTerm);
                const response = await axios.get(
                    `${API_URL}/data/history?page=${currentPage}&search=${formattedSearch}`
                );
                const { data, totalPages, totalItems } = response.data;
                setHistory(data);
                setTotalPages(totalPages);
                setTotalItems(totalItems);

                const start = (currentPage - 1) * 10 + 1;
                const end = start + data.length - 1;
                setItemsRange({ start, end });
            } catch (error) {
                console.error("Error fetching historical data:", error);
            }
        };
        fetchHistory();
    }, [currentPage, debouncedSearchTerm, isEsp32DataConnected]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm]);


    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <br></br>
                <h1>Data Sensor</h1>
            </div>

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
                        {history.map(record => (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.temperature}</td>
                                <td>{record.humidity}</td>
                                <td>{record.light}</td>
                                <td>{new Date(record.created_at).toLocaleString('en-GB', { hour12: false })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationFooter}>
                <span>{isEsp32DataConnected ? `Hiển thị ${itemsRange.start}-${itemsRange.end} của ${totalItems} kết quả` : `Hiển thị ${itemsRange.start}-${itemsRange.end} của ${totalItems} kết quả (Đã đóng băng)`}</span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

export default DataSensor;