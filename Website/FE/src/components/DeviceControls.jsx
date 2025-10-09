import React from 'react';

function DeviceControls({ ledStatus, sendCommand }) {

    const handleToggle = (ledName) => {
        const currentState = ledStatus[ledName];
        const command = `${ledName}${currentState === 'on' ? 'off' : 'on'}`;
        sendCommand(command);
    };

    return (
        <div className="controls-card">
            <h3>Thiết bị</h3>
            <div className="device-list">
                <div className="device-item">
                    <span>Quạt (LED 1)</span>
                    <label className="switch">
                        <input type="checkbox" checked={ledStatus.led1 === 'on'} onChange={() => handleToggle('led1')} />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="device-item">
                    <span>Điều hòa (LED 2)</span>
                    <label className="switch">
                        <input type="checkbox" checked={ledStatus.led2 === 'on'} onChange={() => handleToggle('led2')} />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="device-item">
                    <span>Đèn (LED 3)</span>
                    <label className="switch">
                        <input type="checkbox" checked={ledStatus.led3 === 'on'} onChange={() => handleToggle('led3')} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            {/* We can keep the all on/off buttons as a functional enhancement */}
            <div className="all-controls">
                <button onClick={() => sendCommand('allon')}>All On</button>
                <button onClick={() => sendCommand('alloff')}>All Off</button>
            </div>
        </div>
    );
}

export default DeviceControls;  