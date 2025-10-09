import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../Pagination/Pagination';
import { BsSearch } from 'react-icons/bs';
import styles from './DataSensor.module.css';

const API_URL = 'http://localhost:3001/api';

function DataSensor() {
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsRange, setItemsRange] = useState({ start: 0, end: 0 });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_URL}/data/history?page=${currentPage}`);
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
    }, [currentPage]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <h1>Data Sensor</h1>
                <p className={styles.pageSubtitle}>Tra cứu theo ID cảm biến, tên, vị trí...</p>
            </div>

            <div className={styles.searchBar}>
                <BsSearch className={styles.searchIcon} />
                <input type="text" placeholder="Search..." />
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
                                <td>{record.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationFooter}>
                <span>Hiển thị {itemsRange.start}-{itemsRange.end} của {totalItems} kết quả</span>
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