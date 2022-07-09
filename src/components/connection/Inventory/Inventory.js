import * as yup from 'yup';

import React, { useState, useContext, useRef } from 'react';
import Icon from 'components/Icon/Icon';
import { Connection } from 'dataManagement/ConnectionContext';
import { TextField, FormGroup, Button, Switch, FormControlLabel, IconButton, ToggleButton, Tooltip, MenuItem, Select } from '@mui/material';
import { useAlert } from 'react-alert';
import ChipList from 'components/ChipList/ChipList';


// const modes = {
//     0: { name: "0 (WISP 5/6)", description: "Max Throughput, Tari: 7.14ms" },
//     1: { name: "1", description: "Hybrid, M: 2, Tari: 12.5ms" },
//     2: { name: "2 (WISP 4)", description: "Dense Reader, M: 4, Tari: 25.0ms" },
//     3: { name: "3", description: "Dense Reader, M: 8, Tari: 25.0ms" },
//     4: { name: "4", description: "Max Miller, M: 4, Tari: 7.14ms" },
//     1000: { name: "1000 (Autoset)", description: "Max Miller, M: 4, Tari: 7.14ms" },
// }

const modes = {
    0: { name: "0: Max Throughput", description: "Tari: 7.14ms" },
    1: { name: "1: Hybrid", description: "M: 2, Tari: 12.5ms" },
    2: { name: "2: Dense Reader", description: "M: 4, Tari: 25.0ms" },
    3: { name: "3: Dense Reader", description: "M: 8, Tari: 25.0ms" },
    4: { name: "4: Max Miller", description: "M: 4, Tari: 7.14ms" },
    // 1000: { name: "1000 Reader Autoset", description: "Parameters set by reader" },
    // 1001: { name: "1001 Reader Autoset Static", description: "Parameters set by reader" },
}

const antennaSchema = yup.array().of(yup.number("Antenna must be a number").min(1, "Antenna must be between 1 and 4").max(4, "Antenna must be between 1 and 4")).required();

const Inventory = (props) => {
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

    const toggleInventory = async () => {
        if (connectionStatus.isInventorying) {
            await functions.stopInventory()
        }
        else {
            await functions.startInventory(params.antennas, params.power, params.mode)
        }
    }

    const updateAntennas = (arr) => {
        antennaSchema.validate(arr).then(() => {
            const numArr = arr.map(str => parseInt(str));
            setParams({
                ...params,
                antennas: numArr
            });
        }).catch(err => {
            alert.show(err.message, { title: "", timeout: 3000, type: 'error', icon: 'close' });
        });
    }


    return (
        <div>
            <h2>Inventory</h2>
            <FormGroup sx={{ mt: 1 }}>
                <div className='spacer-1'></div>
                <div>
                    <ChipList
                        color="primary"
                        label="Antennas"
                        sx={{ width: '49%', display: 'inline-block' }}
                        variant="filled"
                        value={params.antennas}
                        disabled={connectionStatus.isInventorying}
                        onChange={updateAntennas}
                    />
                    <TextField
                        label="TX power"
                        variant="filled"
                        sx={{ ml: 1, width: '48%' }}
                        value={params.power}
                        name="power"
                        disabled={connectionStatus.isInventorying}
                        onChange={updateParams}
                    />
                </div>
                <div className='spacer-15'></div>
                <TextField
                    variant="filled"
                    label="Mode identifier"
                    select
                    disabled={connectionStatus.isInventorying}
                    value={params.mode}
                    name="mode"
                    onChange={updateParams}
                    helperText={modes[params.mode].description}
                >
                    {Object.keys(modes).map(key => {
                        return <MenuItem key={key} value={key}>{modes[key].name}</MenuItem>
                    })}
                </TextField>
            </FormGroup>
            <FormGroup sx={{ mt: 1 }}>
                <div className='form-group right top-space'>
                    <Button
                        disabled={connectionStatus.isWaiting || !connectionStatus.isConnected}
                        variant={connectionStatus.isInventorying ? 'outlined' : 'contained'}
                        onClick={(e) => toggleInventory()}
                        color={connectionStatus.isInventorying ? 'error' : 'primary'}
                        sx={{ width: '160px' }}
                        level={connectionStatus.isInventorying ? "2" : "1"}
                    >
                        {(connectionStatus.isInventorying ? "Stop" : "Start") + " inventory"}
                    </Button>
                </div>
            </FormGroup>
        </div>

    )
}

export default Inventory;