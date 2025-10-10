import React from 'react';
import styles from './DeviceControl.module.css';

function DeviceControls({ ledStatus, sendCommand }) {

    const handleToggle = (ledName) => {
        const currentState = ledStatus[ledName];
        const command = `${ledName}${currentState === 'on' ? 'off' : 'on'}`;
        sendCommand(command);
    };

    return (
        <div className={styles.controlsCard}>
            <h3>Thiết bị</h3>
            <div className={styles.deviceList}>
                <div className={styles.deviceItem}>
                    <span>FAN</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={ledStatus.led1 === 'on'} onChange={() => handleToggle('led1')} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>AIR_CONDITIONER</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={ledStatus.led2 === 'on'} onChange={() => handleToggle('led2')} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>LED</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={ledStatus.led3 === 'on'} onChange={() => handleToggle('led3')} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
            <div className={styles.allControls}>
                <button onClick={() => sendCommand('allon')}>All On</button>
                <button onClick={() => sendCommand('alloff')}>All Off</button>
            </div>
        </div>
    );
}

export default DeviceControls;