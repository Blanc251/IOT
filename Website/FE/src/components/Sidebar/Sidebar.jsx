import React from 'react';
import { NavLink } from 'react-router-dom';
import { BsGrid1X2Fill, BsTable, BsClockHistory, BsPersonCircle } from 'react-icons/bs';
import styles from './Sidebar.module.css';

function Sidebar() {
    return (
        <nav className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h3>IOT</h3>
            </div>
            <ul className={styles.sidebarMenu}>
                <li><NavLink to="/"><BsGrid1X2Fill /><span>Dashboard</span></NavLink></li>
                <li><NavLink to="/data-sensor"><BsTable /><span>Data Sensor</span></NavLink></li>
                <li><NavLink to="/action-history"><BsClockHistory /><span>Action History</span></NavLink></li>
                <li><NavLink to="/profile"><BsPersonCircle /><span>Profile</span></NavLink></li>
            </ul>
        </nav>
    );
}

export default Sidebar;