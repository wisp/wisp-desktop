import './Network.scss';

import React, { useState, useContext, useRef } from 'react';
import Icon from 'components/Icon/Icon';
import { Connection } from 'dataManagement/ConnectionContext';
import { TextField, FormGroup, Button, Switch, FormControlLabel, IconButton, ToggleButton, Tooltip } from '@mui/material';
import ReaderConsole from 'components/connection/ReaderConsole/ReaderConsole';
import { useAlert } from 'react-alert';

const Network = (props) => {
    const alert = useAlert();
    const context = useContext(Connection);
    const functions = context.connectionFunctions;
    const connectionStatus = context.connectionStatus;

    const [params, setParams] = context.settings

    const updateParams = (e) => {
        setParams({
            ...params,
            [e.target.name]: e.target.value
        });
    }

    const updateConsole = () => {
        setParams({
            ...params,
            showConsole: !params.showConsole
        });
    }

    const toggleConnection = async () => {
        if (connectionStatus.isConnected) {
            await functions.disconnect()
        }
        else {
            await functions.connect(params.host, params.port)
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
                        value={params.host}
                        onChange={updateParams}
                    />
                    <TextField
                        disabled={connectionStatus.isConnected || connectionStatus.isWaiting}
                        id="filled-basic"
                        label="Port"
                        variant="filled"
                        sx={{ width: '24%' }}
                        value={params.port}
                        onChange={updateParams}
                    />
                </div>
            </FormGroup>
            {params.showConsole && <ReaderConsole />}
            <FormGroup sx={{ mt: 1 }}>
                <div className='form-group right top-space'>
                    <Tooltip title={(params.showConsole ? "Hide" : "Show") + " reader console"} placement='left'>
                        <ToggleButton
                            selected={params.showConsole}
                            name="showConsole"
                            onClick={updateConsole}
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