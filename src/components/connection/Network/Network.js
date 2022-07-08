import './Network.scss';

import React, { useState, useContext, useRef } from 'react';
import Icon from 'components/Icon/Icon';
import { Connection } from 'dataManagement/ConnectionContext';
import { TextField, FormGroup, Button, Switch, FormControlLabel, IconButton, ToggleButton, Tooltip } from '@mui/material';
import ReaderConsole from 'components/connection/ReaderConsole/ReaderConsole';
import { useAlert } from 'react-alert';

const modes = {
    0: "Tari: 7140μs, PIE:1500, BDR:640000, R: 1, C:0, M:2, Mod: 2",
    1: "Tari: 12500μs, PIE:1500, BDR:160000, R: 0, C:0, M:2, Mod: 2",
    2: "Tari: 25000μs, PIE:2000, BDR:256000, R: 1, C:1, M:3, Mod: 3",
    3: "Tari: 25000μs, PIE:2000, BDR:256000, R: 1, C:0, M:3, Mod: 3",
    4: "Tari: 7140μs, PIE:1500, BDR:640000, R: 1, C:1, M:2, Mod: 2",
}

const Network = (props) => {
    const alert = useAlert();
    const context = useContext(Connection);
    const functions = context.connectionFunctions;
    const connectionStatus = context.connectionStatus;
    const [showConsole, setShowConsole] = useState(false);

    const [network, setNetwork] = useState({
        host: "",
        port: 5084,
    });

    const updateNetwork = (e) => {
        setNetwork({
            ...network,
            [e.target.name]: e.target.value
        });
    }

    const toggleConnection = async () => {
        if (connectionStatus.isConnected) {
            await functions.disconnect()
        }
        else {
            await functions.connect(network.host, network.port)
        }
    }

    return (
        <div>
            <h2>Network</h2>
            <FormGroup sx={{ mt: 0.5 }} >
                <div>
                    <TextField
                        disabled={connectionStatus.isConnected || connectionStatus.isWaiting}
                        id="filled-basic"
                        label="Hostname"
                        variant="filled"
                        name="host"
                        sx={{ mr: 1, width: '73%' }}
                        value={network.host}
                        onChange={updateNetwork}
                    />
                    <TextField
                        disabled={connectionStatus.isConnected || connectionStatus.isWaiting}
                        id="filled-basic"
                        label="Port"
                        variant="filled"
                        sx={{ width: '24%' }}
                        value={network.port}
                        onChange={updateNetwork}
                    />
                </div>
            </FormGroup>
            {showConsole && <ReaderConsole />}
            <FormGroup sx={{ mt: 1 }}>
                <div className='form-group right top-space'>
                    <Tooltip title={(showConsole ? "Hide" : "Show") + " reader console"} placement='left'>
                        <ToggleButton
                            selected={showConsole}
                            onClick={() => setShowConsole(!showConsole)}
                            sx={{ borderRadius: '100px', width: '36.5px' }}
                            size="small"
                            variant="contained"
                            color="primary"
                        >
                            <Icon name="terminal" />
                        </ToggleButton>
                    </Tooltip>
                    <Button
                        disabled={connectionStatus.isWaiting}
                        variant={connectionStatus.isConnected ? 'outlined' : 'contained'}
                        onClick={(e) => toggleConnection()}
                        color={connectionStatus.isConnected ? 'error' : 'primary'}
                        sx={{ width: '120px' }}
                        level={connectionStatus.isConnected ? "2" : "1"}
                    >
                        {connectionStatus.isConnected ? "Disconnect" : "Connect"}
                    </Button>
                </div>
            </FormGroup>
        </div>

    )
}

export default Network;