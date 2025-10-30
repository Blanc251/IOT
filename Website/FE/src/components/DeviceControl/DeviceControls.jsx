import React from 'react';
import styles from './DeviceControl.module.css';

function DeviceControls({ ledStatus, sendCommand, isEsp32DataConnected }) {

    const handleToggle = (ledName) => {
        if (!isEsp32DataConnected) return;
        const currentState = ledStatus[ledName];
        const command = `${ledName}${currentState === 'on' ? 'off' : 'on'}`;
        sendCommand(command);
    };

    const handleSwitchClick = (e) => {
        if (!isEsp32DataConnected) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    return (
        <div className={styles.controlsCard}>
            <h3>Devices</h3>
            <div className={styles.deviceList}>
                <div className={styles.deviceItem}>
                    <span>FAN</span>
                    <label className={styles.switch} onClick={handleSwitchClick}>
                        {/* Now disabled based on isEsp32DataConnected */}
                        <input type="checkbox" checked={ledStatus.led1 === 'on'} onChange={() => handleToggle('led1')} disabled={!isEsp32DataConnected} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>AIR_CONDITIONER</span>
                    <label className={styles.switch} onClick={handleSwitchClick}>
                        <input type="checkbox" checked={ledStatus.led2 === 'on'} onChange={() => handleToggle('led2')} disabled={!isEsp32DataConnected} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>LED</span>
                    <label className={styles.switch} onClick={handleSwitchClick}>
                        {/* Now disabled based on isEsp32DataConnected */}
                        <input type="checkbox" checked={ledStatus.led3 === 'on'} onChange={() => handleToggle('led3')} disabled={!isEsp32DataConnected} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
            <div className={styles.allControls}>
                <button onClick={() => sendCommand('allon')} disabled={!isEsp32DataConnected}>All On</button>
                <button onClick={() => sendCommand('alloff')} disabled={!isEsp32DataConnected}>All Off</button>
            </div>
        </div>
    );
}

export default DeviceControls;