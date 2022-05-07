import './ConnectionWindow.scss';

import WindowBar from 'components/window/WindowBar/WindowBar';
import Icon from 'components/Icon/Icon';
import React, { useState, useContext } from 'react';
import Inventory from 'components/connection/Inventory/Inventory';
import ConnectionStatus from 'components/connection/ConnectionStatus/ConnectionStatus';
import { Connection } from 'dataManagement/ConnectionContext';



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
                            Connection Details
                        </div>
                        <div className='bottom'>
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`window connection-window ${barColor}`}>
            <WindowBar
                title="Connection Details"
                right={<Icon
                    name="chevron_left"
                    click={(e) => setCollapsed(true)}
                />}
            />
            <div className="window-content">
                <Inventory />
                <div className='spacer-3'></div>
                <ConnectionStatus />
            </div>
        </div>
    );
}

export default ConnectionWindow;