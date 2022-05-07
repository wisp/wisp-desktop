// import './Connection.scss';
import { Connection } from 'dataManagement/ConnectionContext';
import { TagData } from 'dataManagement/EelListener';
import { useContext, useEffect, useCallback, useState } from 'react';
// import { getRelativeTime } from '../../../global/helperFunctions';


const ConnectionStatus = (props) => {
    const [connection, setConnection] = useContext(Connection);
    const tagData = useContext(TagData).data;

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    function getTagRate(interval=15) {
        if (connection.status.connected) {
            // get the time from 15 seconds ago
            const time = new Date().getTime() / 1000 - interval;
            console.log(time);
            // get the tags that were added in the last 15 seconds
            const tags = tagData.filter(tag => tag.seen > time);
            // get the number of tags that were added in the last 15 seconds
            const tagRate = tags.length;
            // return the tag rate
            return tagRate / interval;
        }
        return 0.0;
    }
    let tagRate = getTagRate(5).toFixed(1);

    useEffect(() => {
        const updater = setInterval(() => {
            if (connection.status.connected) {
                forceUpdate();
            } else {
                clearInterval(updater);
            }
        }, 200);
        return () => {
            clearInterval(updater);
        }
    }, []);
        

    return (
        <div className="connection-status">
            <div className="status-group">
                <div className="status">
                    <div className="label">Status</div>
                    <div className="value">{connection.status.connected ? "Connected" : "Disconnected"}</div>
                </div>
                <div className="status">
                    <div className="label">Last started</div>
                    <div className="value">{new Date(connection.status.started * 1000).toLocaleTimeString()}</div>
                </div>
                
                {/* <div className="status">
                    <div className="label">Last tag</div>
                    <div className="value">{new Date(tagData[tagData.length - 1].seen).toLocaleTimeString()} </div>
                </div> */}
                <div className="status">
                    <div className="label">Total tag reads</div>
                    <div className="value">{tagData.length} tag{tagData.length === 1 ? "" : "s"}</div>
                </div>
                <div className="status">
                    <div className="label">Inventory rate</div>
                    <div className="value">{tagRate} tag{tagRate === 1 ? "" : "s"}/sec</div>
                </div>
                
            </div>
        </div>
    );
}

export default ConnectionStatus;