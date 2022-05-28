import { useState, createContext, useEffect } from 'react'
import { useAlert } from 'react-alert';

const Connection = createContext({});



const ConnectionContext = (props) => {
    console.log("rendering Connection Context")
    const [connection, setConnection] = useState({
        status: {
            connected: false,
            tagCount: 0,
            tagRate: 0,
            mostRecent: -1,
            started: -1,
        },
        settings: {
            host: "",
            port: 5084,
            tari: 7140,
            antennas: [1],
            power: 0,
            mode: 0,
            debugLogs: false,
        },
        filters: {
            whitelist: [],
            blacklist: [],
        }
    });

    useEffect(() => {
        window.eel.changeFilters(connection.filters.whitelist, connection.filters.blacklist)
    }, [connection.filters]);

    return (
        <Connection.Provider value={[connection, setConnection]}>
            { props.children }
        </Connection.Provider>
    );
}

export { ConnectionContext, Connection }; 