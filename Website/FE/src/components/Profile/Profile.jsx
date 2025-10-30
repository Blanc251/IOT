import React from 'react';
import styles from './Profile.module.css';
import { BsEnvelope, BsPhone, BsGithub, BsGeoAlt, BsBook } from 'react-icons/bs';

function Profile() {
    return (
        <div className={styles.pageWrapper}>
            <h1>Profile Settings</h1>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <img src="/avatar.png" alt="User Avatar" className={styles.avatar} />
                    <h2 className={styles.name}>Vu Duc Vui</h2>
                    <p className={styles.role}>Student</p>
                </div>
                <div className={styles.profileDetails}>
                    <div className={styles.infoRow}>
                        <BsEnvelope className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>vuivd.b22cn921@gmail.com</span>
                        </div>
                    </div>
                    <div className={styles.infoRow}>
                        <BsPhone className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}>0865432424</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <BsGithub className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>GitHub</span>
                            <a className={styles.valueLink} href="https://github.com/Blanc251/IOT" target="_blank" rel="noopener noreferrer">
                                Blanc251
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <BsBook className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>Read API Docs</span>
                            <a className={styles.valueLink} href="http://localhost:3001/api-docs" target="_blank" rel="noopener noreferrer">
                                Swagger API
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <BsBook className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>Read Project Docs</span>
                            <a className={styles.valueLink} href="https://github.com/Blanc251/IOT/blob/main/VuDucVui_B22DCCN921_IOT.pdf" target="_blank" rel="noopener noreferrer">
                                Project Document (PDF)
                            </a>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <BsGeoAlt className={styles.icon} />
                        <div className={styles.infoText}>
                            <span className={styles.label}>Location</span>
                            <span className={styles.value}>Hanoi, Vietnam</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;