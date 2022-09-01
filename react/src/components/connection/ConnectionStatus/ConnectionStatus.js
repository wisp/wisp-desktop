// import './Connection.scss';
import { Connection } from 'dataManagement/ConnectionContext';
import { TagData } from 'dataManagement/EelListener';
import { useContext, useEffect, useCallback, useState } from 'react';
// import { getRelativeTime } from '../../../global/helperFunctions';


const ConnectionStatus = (props) => {
    const connectionStatus = useContext(Connection).connectionStatus;
    const tagData = useContext(TagData).data;

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);


    // Two approaches to getting the tag rate
    // 1. Measure the time between the last n tag updates
    // 2. Measure the number of tags in the last n seconds
    // 
    // 2 is more accurate, but requires that we know the 
    // time relative to the last tag update. That's why we
    // use `seenUI` instead of `seen` to calculate rate.
    function getTagRate(interval = 5) {
        // get the time from 15 seconds ago
        const time = new Date().getTime() / 1000 - interval;
        // get the tags that were added in the last 15 seconds
        const tags = tagData.filter(tag => tag.seenUI > time);
        // get the number of tags that were added in the last 15 seconds
        const tagRate = tags.length;
        // return the tag rate
        return tagRate / interval;
    }


    let tagRate = getTagRate(5).toFixed(1);

    useEffect(() => {
        const updater = setInterval(() => {
            forceUpdate();
        }, 250);
        return () => {
            clearInterval(updater);
        }
    }, []);


    return (
        <div className="connection-status">
            <h2>Current Status</h2>
            <div className="status-group">
                <div className="status">
                    <div className="label">Status</div>
                    <div className="value">{connectionStatus.isWaiting ? "Waiting" : connectionStatus.isInventorying ? 'Inventory' : connectionStatus.isConnected ? "Connected" : "Disconnected"}</div>
                </div>
                <div className="status">
                    <div className="label">Last started</div>
                    <div className="value">{new Date(connectionStatus.lastInventoryStarted * 1000).toLocaleTimeString()}</div>
                </div>
                <div className="status">
                    <div className="label">Total tag reads</div>
                    <div className="value">{tagData.length} tag{tagData.length === 1 ? "" : "s"}</div>
                </div>
                <div className="status">
                    <div className="label">Inventory rate</div>
                    <div className="value">{tagRate} /sec</div>
                </div>

            </div>
        </div>
    );
}

export default ConnectionStatus;