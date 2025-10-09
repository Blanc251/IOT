import React from 'react';
import styles from './SummaryCard.module.css';

function SummaryCard({ icon, title, value, unit, status, statusType }) {
    return (
        <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>{icon}</div>
                <h3>{title}</h3>
            </div>
            <h2>{value}{unit}</h2>
            <span className={`${styles.statusBadge} ${styles[statusType]}`}>{status}</span>
        </div>
    );
}

export default SummaryCard;