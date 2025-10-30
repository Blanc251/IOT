import React from 'react';
import styles from './DeviceControl.module.css';

function DeviceControls({ ledStatus, sendCommand, isEsp32DataConnected, deviceLoading }) {

    const handleToggle = (ledName) => {
        if (!isEsp32DataConnected || (deviceLoading && deviceLoading[ledName])) return;
        const currentState = ledStatus[ledName];
        const command = `${ledName}${currentState === 'on' ? 'off' : 'on'}`;
        sendCommand(command, ledName);
    };

    const handleSwitchClick = (e, ledName) => {
        if (!isEsp32DataConnected || (deviceLoading && deviceLoading[ledName])) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    const isAnyLoading = deviceLoading && (deviceLoading.led1 || deviceLoading.led2 || deviceLoading.led3);

    return (
        <div className={styles.controlsCard}>
            <h3>Devices</h3>
            <div className={styles.deviceList}>
                <div className={styles.deviceItem}>
                    <span>FAN</span>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led1')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led1 === 'on'}
                            onChange={() => handleToggle('led1')}
                            disabled={!isEsp32DataConnected || (deviceLoading && deviceLoading.led1)}
                        />
                        {deviceLoading && deviceLoading.led1 ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>AIR_CONDITIONER</span>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led2')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led2 === 'on'}
                            onChange={() => handleToggle('led2')}
                            disabled={!isEsp32DataConnected || (deviceLoading && deviceLoading.led2)}
                        />
                        {deviceLoading && deviceLoading.led2 ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>
                <div className={styles.deviceItem}>
                    <span>LED</span>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led3')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led3 === 'on'}
                            onChange={() => handleToggle('led3')}
                            disabled={!isEsp32DataConnected || (deviceLoading && deviceLoading.led3)}
                        />
                        {deviceLoading && deviceLoading.led3 ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>
            </div>
            <div className={styles.allControls}>
                <button onClick={() => sendCommand('allon', 'all')} disabled={!isEsp32DataConnected || isAnyLoading}>All On</button>
                <button onClick={() => sendCommand('alloff', 'all')} disabled={!isEsp32DataConnected || isAnyLoading}>All Off</button>
            </div>
        </div>
    );
}

export default DeviceControls;