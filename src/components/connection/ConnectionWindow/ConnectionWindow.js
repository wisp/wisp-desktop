import './ConnectionWindow.scss';

import WindowBar from 'components/window/WindowBar/WindowBar';
import Icon from 'components/Icon/Icon';
import React, { useState, useContext } from 'react';
import Inventory from 'components/connection/Inventory/Inventory';
import ConnectionStatus from 'components/connection/ConnectionStatus/ConnectionStatus';
import Filter from 'components/connection/Filter/Filter';
import { Connection } from 'dataManagement/ConnectionContext';
import DataButtons from 'components/connection/DataButtons/DataButtons';



const ConnectionWindow = (props) => {

    const [collapsedWindow, setCollapsed] = useState(false);
    const [connection, setConnection] = useContext(Connection);

    const barColor = connection.status.connected ? "green" : "red";

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
                            {connection.status.connected ? "Connected" : "Disconnected"}
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
                <Inventory />
                <div className='spacer-4'></div>
                <Filter />
                <div className='spacer-4'></div>
                <ConnectionStatus />
                <div className='spacer-4'></div>
                <DataButtons />
            </div>
        </div>
    );
}

export default ConnectionWindow;