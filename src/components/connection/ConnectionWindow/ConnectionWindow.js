import './ConnectionWindow.scss';

import WindowBar from 'components/window/WindowBar/WindowBar';
import Icon from 'components/Icon/Icon';
import React, { useState, useContext } from 'react';
import Network from 'components/connection/Network/Network';
import ConnectionStatus from 'components/connection/ConnectionStatus/ConnectionStatus';
import Filter from 'components/connection/Filter/Filter';
import Inventory from 'components/connection/Inventory/Inventory';
import { Connection } from 'dataManagement/ConnectionContext';
import DataButtons from 'components/connection/DataButtons/DataButtons';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';


const ConnectionWindow = (props) => {

    const [collapsedWindow, setCollapsed] = useState(false);
    const connectionStatus = useContext(Connection).connectionStatus;

    const barColor = connectionStatus.isWaiting ? "yellow" : connectionStatus.isInventorying ? 'blue' : connectionStatus.isConnected ? "green" : "red";

    if (collapsedWindow) {
        return (
            <div onClick={(e) => setCollapsed(false)} className={`window connection-window collapsed ${barColor}`}>
                <div className="window-content">
                    <Icon name="chevron_right" click={(e) => setCollapsed(false)}></Icon>
                    {/* <div className="spacer-1"></div> */}
                    <div className='small-connection-details'>
                        <div className='title'>
                            Connection
                        </div>
                        <div className='bottom'>
                            {connectionStatus.isWaiting ? "Waiting" : connectionStatus.isInventorying ? 'Inventory' : connectionStatus.isConnected ? "Connected" : "Disconnected"}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`window connection-window ${barColor}`}>
            <WindowBar
                title="Connection"
                right={<Icon
                    name="chevron_left"
                    click={(e) => setCollapsed(true)}
                />}
            />
            <div className="window-content">
                <ErrorBoundary>
                    <Network />
                </ErrorBoundary>
                <div className='spacer-3'></div>
                <ErrorBoundary>
                    <Inventory />
                </ErrorBoundary>
                <div className='spacer-3'></div>
                <ErrorBoundary>
                    <Filter />
                </ErrorBoundary>
                <div className='spacer-3'></div>
                <ErrorBoundary>
                    <ConnectionStatus />
                </ErrorBoundary>
                <div className='spacer-3'></div>
                <ErrorBoundary>
                    <DataButtons />
                </ErrorBoundary>
                <div className='spacer-2'></div>
            </div>
        </div>
    );
}

export default ConnectionWindow;