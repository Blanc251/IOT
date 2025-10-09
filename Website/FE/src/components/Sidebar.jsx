import React from 'react';
import { NavLink } from 'react-router-dom';
import { BsGrid1X2Fill, BsTable, BsClockHistory, BsPersonCircle } from 'react-icons/bs';

function Sidebar() {
    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h3>IOT</h3>
            </div>
            <ul className="sidebar-menu">
                {/* 2. Replace all <a> tags with NavLink and href="#" with to="/path" */}
                <li><NavLink to="/"><BsGrid1X2Fill /><span>Dashboard</span></NavLink></li>
                <li><NavLink to="/data-sensor"><BsTable /><span>Data Sensor</span></NavLink></li>
                <li><NavLink to="/action-history"><BsClockHistory /><span>Action History</span></NavLink></li>
                <li><NavLink to="/profile"><BsPersonCircle /><span>Profile</span></NavLink></li>
            </ul>
        </nav>
    );
}

export default Sidebar;