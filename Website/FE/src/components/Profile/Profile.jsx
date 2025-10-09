import React, { useState } from 'react';
import styles from './Profile.module.css';

function Profile() {
    const [profile, setProfile] = useState({
        name: 'Vu Dinh Vu',
        email: 'vudinhvu@example.com',
        phone: '0123 456 789',
        address: '123 ABC Street, Hanoi, Vietnam',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Profile Updated:', profile);
    };

    return (
        <div className={styles.pageWrapper}>
            <h1>Profile</h1>
            <div className={styles.profileContent}>
                <div className={`${styles.profileCard} ${styles.profileHeader}`}>
                    <img src="/avatar.png" alt="User Avatar" className={styles.avatar} />
                    <h2>{profile.name}</h2>
                    <p>{profile.email}</p>
                    <button>Change Picture</button>
                </div>
                <div className={`${styles.profileCard} ${styles.profileDetails}`}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={profile.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={profile.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        <hr className={styles.divider} />

                        <h3>Change Password</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword">New Password</label>
                            <input type="password" id="newPassword" />
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;