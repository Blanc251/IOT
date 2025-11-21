import React from 'react';
import styles from './DeviceControl.module.css';
import { BsExclamationTriangleFill } from 'react-icons/bs';

function DeviceControls({ ledStatus, sendCommand, isEsp32DataConnected, deviceLoading, isAlarmOn }) {

    const handleToggle = (ledName) => {
        if (!isEsp32DataConnected || (deviceLoading && deviceLoading[ledName])) {
            return;
        }

        const currentState = ledStatus[ledName];
        const newState = currentState === 'on' ? 'off' : 'on';
        const command = `${ledName}${newState}`;

        sendCommand(command, ledName, newState);
    };

    const handleSwitchClick = (e, ledName) => {
        if (!isEsp32DataConnected || (deviceLoading && deviceLoading[ledName])) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    const isAnyLoading = (deviceLoading && (deviceLoading.led1 || deviceLoading.led2 || deviceLoading.led3));

    const allOnState = { led1: 'on', led2: 'on', led3: 'on' };
    const allOffState = { led1: 'off', led2: 'off', led3: 'off' };

    const isLoading = (ledName) => (deviceLoading && deviceLoading[ledName]);

    return (
        <div className={styles.controlsCard}>
            <h3>Devices</h3>
            <div className={styles.deviceList}>
                <div className={styles.deviceItem}>
                    <div className={styles.deviceInfo}>
                        <span>FAN</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led1')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led1 === 'on'}
                            onChange={() => handleToggle('led1')}
                            disabled={!isEsp32DataConnected || isLoading('led1')}
                        />
                        {isLoading('led1') ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>

                <div className={styles.deviceItem}>
                    <div className={styles.deviceInfo}>
                        <span>AIR_CONDITIONER</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led2')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led2 === 'on'}
                            onChange={() => handleToggle('led2')}
                            disabled={!isEsp32DataConnected || isLoading('led2')}
                        />
                        {isLoading('led2') ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>

                <div className={styles.deviceItem}>
                    <div className={styles.deviceInfo}>
                        <span>LED</span>
                    </div>
                    <label className={styles.switch} onClick={(e) => handleSwitchClick(e, 'led3')}>
                        <input
                            type="checkbox"
                            checked={ledStatus.led3 === 'on'}
                            onChange={() => handleToggle('led3')}
                            disabled={!isEsp32DataConnected || isLoading('led3')}
                        />
                        {isLoading('led3') ? (
                            <div className={styles.loadingSpinnerContainer}>
                                <div className={styles.loadingSpinner}></div>
                            </div>
                        ) : (
                            <span className={styles.slider}></span>
                        )}
                    </label>
                </div>

                <div className={`${styles.deviceItem} ${isAlarmOn ? styles.alarmIconActive : ''}`}>
                    <div className={styles.deviceInfo}>
                        <BsExclamationTriangleFill className={styles.deviceIcon} />
                        <span>Alert LED</span>
                    </div>
                </div>
            </div>

            <div className={styles.allControls}>
                <button onClick={() => sendCommand('allon', 'all', allOnState)} disabled={!isEsp32DataConnected || isAnyLoading}>All On</button>
                <button onClick={() => sendCommand('alloff', 'all', allOffState)} disabled={!isEsp32DataConnected || isAnyLoading}>All Off</button>
            </div>
        </div>
    );
}

export default DeviceControls;