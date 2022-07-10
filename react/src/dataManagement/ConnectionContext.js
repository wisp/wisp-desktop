import { useState, createContext, useEffect, useRef } from 'react'
import { useAlert } from 'react-alert';
import * as yup from 'yup';

import { hostNameRegex } from 'global/helperFunctions';
import Alerts from 'components/Alerts/Alerts';


const Connection = createContext({});

const networkSchema = yup.object({
    host: yup.string().required('A hostname is required').matches(hostNameRegex, 'Invalid hostname'),
    port: yup.number('Port must be a number').min(1, 'Port must be between 1-65535').max(65535, 'Port must be between 1-65535'),
})

const settingsSchema = yup.object({
    power: yup.number('TX power must be a number').min(0, 'TX power must be between 0-60').max(60, 'Tari must be between 0-60'),
    antennas: yup.array().of(yup.number('Antenna must be a number').min(1, 'Antenna must be between 1-8').max(8, 'Antenna must be between 1-8')),
    mode: yup.number('Mode must be a number').min(0, 'Mode must be between 0-4').max(4, 'Mode must be between 0-4'),
})

const filterSchema = yup.object({
    whitelist: yup.array().of(yup.string().uppercase().length(4, 'WISP ID must be 4 characters long').matches('^[A-Fa-f0-9]{4}$', 'Invalid WISP ID')),
    blacklist: yup.array().of(yup.string().uppercase().length(4, 'WISP ID must be 4 characters long').matches('^[A-Fa-f0-9]{4}$', 'Invalid WISP ID')),
})

const ConnectionContext = (props) => {
    const alert = useAlert();
    console.log("rendering Connection Context")

    const [_connectionStatus, _setConnectionStatus] = useState({
        isConnected: false,
        isInventorying: false,
        isWaiting: false,
        lastInventoryStarted: undefined,
    });

    const connectionStatusRef = useRef(_connectionStatus);
    const setConnectionStatus = (newStatus) => {
        connectionStatusRef.current = newStatus;
        _setConnectionStatus(newStatus);
    }

    const [filters, setFilters] = useState({
        whitelist: [],
        blacklist: [],
    });

    const [params, setParams] = useState({
        host: '',
        port: 5084,
        showConsole: false,
        power: 60,
        antennas: [1],
        mode: 0,
    });

    const lock = () => {
        updateStatus({ isWaiting: true })
    }

    const unlock = () => {
        updateStatus({ isWaiting: false })
    }

    const updateStatus = (status) => {
        setConnectionStatus({
            ...connectionStatusRef.current,
            ...status,
        });
    }

    const connect = async (host, port) => {
        lock();
        networkSchema.validate({ host, port }).then(async () => {
            const success = await window.eel.connect(host, parseInt(port))()
            if (success) {
                alert.success("Connected to the reader", { title: "Connected", icon: 'cable' });
                updateStatus({ isConnected: true })
            } else {
                alert.error("Check the hostname and port", { title: "Unable to connect", icon: 'cable' });
            }
            unlock();
        }).catch(err => {
            unlock();
            alert.error(err.message, { title: "Unable to connect", icon: 'cable' });
        })
        
    }

    const disconnect = async () => {
        lock();
        const success = await window.eel.disconnect()()
        if (success) {
            alert.info("Disconnected from the reader", { title: "Disconnected", icon: 'cable' });
            updateStatus({ isConnected: false, isInventorying: false })
            unlock();
        } else {
            unlock();
            alert.error("Something went wrong", { title: "Unable to disconnect", icon: 'cable' });
        }
    }

    const startInventory = async (antennas, power, mode) => {
        lock();
        settingsSchema.validate({ antennas, power, mode }).then(async () => {
            const success = await window.eel.startInventory(antennas, parseInt(power), parseInt(mode))()
            if (success) {
                alert.success("Accepting tags from the reader", { title: "Inventory Started", icon: 'leak_add' });
                updateStatus({ isInventorying: true, lastInventoryStarted: Math.floor(Date.now() / 1000) })
                unlock();
            } else {
                unlock();
                alert.error("Check your parameters and try again", { title: "Unable to start inventory", icon: 'leak_add' });
            }
        })
    }

    const stopInventory = async () => {
        lock();
        const success = await window.eel.stopInventory()()
        if (success) {
            alert.info("No longer accepting tags", { title: "Inventory Stopped", icon: 'leak_remove' });
            updateStatus({ isInventorying: false })
            unlock();
        } else {
            unlock();
            alert.error("Something went wrong", { title: "Unable to start inventory", icon: 'leak_remove' });
        }
    }

    const forceState = async (state) => {
        if (state.isConnected != connectionStatusRef.current.isConnected || state.isInventorying != connectionStatusRef.current.isInventorying) {
            alert.error("Something went wrong with the reader state", { title: "Unexpected reader state", icon: 'sync_problem' });
        }
        updateStatus(state);
    }

    // const changeFilters = async (whitelist, blacklist) => {
    //     // This is likely the second time it's being validated, but it can't hurt
    //     // alert.info("updating filters")
    //     filterSchema.validate({ whitelist, blacklist }).then(async () => {
    //         const success = await window.eel.changeFilters(whitelist, blacklist)()
    //         if (success) {
    //             window.eel.changeFilters(whitelist, blacklist)()
    //         } else {
    //             alert.error("Failed to change filters!")
    //         }
    //     })
    // }

    useEffect(() => {
        filterSchema.validate(filters).then(async () => {
            const success = await window.eel.changeFilters(filters.whitelist, filters.blacklist)()
            if (success) {

            } else {
                alert.error("Failed to change filters")
            }
        }).catch(err => {
            alert.error(err.message, { title: "Unable to change filters", icon: 'filter' });
        })
    }, [filters])

    const connectionFunctions = {
        connect,
        disconnect,
        startInventory,
        stopInventory,
        // changeFilters,
        forceState,
    }

    return (
        <Connection.Provider value={{ connectionFunctions, connectionStatus: _connectionStatus, filter: [filters, setFilters], settings: [params, setParams] }}>
            {props.children}
        </Connection.Provider>
    );
}

export { ConnectionContext, Connection }; 