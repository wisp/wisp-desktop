// import './Connection.scss';
import { Connection } from '../../../components/EelListener';
import { useContext } from 'react';


const ConnectionStatus = (props) => {
    const [connection, setConnection] = useContext(Connection);

    return (
        <div className="connection-status">
            <div className="status-group">
                <div className="status">
                    <div className="label">Status</div>
                    <div className="value">{connection.status.connected ? "Connected" : "Disconnected"}</div>
                </div>
                <div className="status">
                    <div className="label">Inventory rate</div>
                    <div className="value">{connection.status.tagRate} tags/sec</div>
                </div>
                <div className="status">
                    <div className="label">Uptime</div>
                    <div className="value">None</div>
                </div>
                <div className="status">
                    <div className="label">Total tags</div>
                    <div className="value">283</div>
                </div>
            </div>
        </div>
    );
}

export default ConnectionStatus;