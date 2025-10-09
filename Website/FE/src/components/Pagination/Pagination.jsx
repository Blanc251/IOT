import React from 'react';
import styles from './Pagination.module.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push('...');
            }
            if (currentPage > 2) {
                pages.push(currentPage - 1);
            }
            if (currentPage !== 1 && currentPage !== totalPages) {
                pages.push(currentPage);
            }
            if (currentPage < totalPages - 1) {
                pages.push(currentPage + 1);
            }
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            pages.push(totalPages);
        }
        return [...new Set(pages)];
    };

    return (
        <nav className={styles.paginationContainer}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                &lt; Prev
            </button>
            {getPageNumbers().map((page, index) =>
                page === '...' ? (
                    <span key={index} className={styles.paginationEllipsis}>...</span>
                ) : (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={currentPage === page ? styles.active : ''}
                    >
                        {page}
                    </button>
                )
            )}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next &gt;
            </button>
        </nav>
    );
}

export default Pagination;