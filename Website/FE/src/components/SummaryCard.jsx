import React from 'react';

function SummaryCard({ icon, title, value, unit, status, statusType }) {
    return (
        <div className="summary-card">
            <div className="card-header">
                <div className="card-icon">{icon}</div>
                <h3>{title}</h3>
            </div>
            <h2>{value}{unit}</h2>
            <span className={`status-badge ${statusType}`}>{status}</span>
        </div>
    );
}

export default SummaryCard;