import { useState, createContext } from 'react'

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
        },
        filters: {
            whitelist: [],
            blacklist: [],
        }
    });

    return (
        <Connection.Provider value={[connection, setConnection]}>
            { props.children }
        </Connection.Provider>
    );
}

export { ConnectionContext, Connection }; 