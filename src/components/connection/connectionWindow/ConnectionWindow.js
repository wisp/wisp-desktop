import './ConnectionWindow.scss';

import WindowBar from '../../WindowBar';
import Button from '../../Button';
import Icon from '../../Icon';
import React, { useState } from 'react';
import Inventory from '../inventory/Inventory';
import ConnectionStatus from '../connectionStatus/ConnectionStatus';



const ConnectionWindow = (props) => {

    const [collapsedWindow, setCollapsed] = useState(false);
    
    if (collapsedWindow) {
        return (
            <div onClick={(e) => setCollapsed(false)} className="window connection-window collapsed">
                <div className="window-content">
                    <Icon name="chevron_right" click={(e) => setCollapsed(false)}></Icon>
                    {/* <div className="spacer-1"></div> */}
                    <div className='small-connection-details'>
                        <div className='title'>
                            Connection Details
                        </div>

                        <div className='bottom'>
                            Connected&nbsp;&nbsp;·&nbsp;&nbsp;50 tags/sec
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="window connection-window">
            <WindowBar
                title="Connection Details"
                right={<Icon
                    name="chevron_left"
                    click={(e) => setCollapsed(true)}
                />}
            />
            <div className="window-content">
                <Inventory/>
                <div className='spacer-3'></div>
                <ConnectionStatus/>
            </div>
        </div>
    );
}

export default ConnectionWindow;