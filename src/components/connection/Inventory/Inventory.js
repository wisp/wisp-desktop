import './Inventory.scss';

// import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useFormik } from 'formik';
import * as yup from 'yup';

import React, { useState, useContext, useRef } from 'react';
import Modal from 'components/Modal/Modal';
// import { Button } from 'components/Button/Button';
import Icon from 'components/Icon/Icon';
import { Connection } from 'dataManagement/ConnectionContext';
import { TextField, FormGroup, Button, IconButton, Tooltip, Checkbox, FormControlLabel } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';
import ReaderConsole from 'components/connection/ReaderConsole/ReaderConsole';

// TODO: Switch to Formik so we can use validation.
//       Make the modal save values before it's modified so that if closed, we can restore the old values.

const validation = yup.object({
    host: yup.string('Enter the reader hostname').required(),
    port: yup.number('Must be a number').min(1, 'Must be between 1-65535').max(65535, 'Must be between 1-65535')
})

const Inventory = (props) => {

    const [connection, setConnection] = useContext(Connection);
    const [showModal, setShowModal] = useState(false);

    const connectionRef = useRef();
    connectionRef.current = connection;

    const formik = useFormik({
        initialValues: {
            host: connection.settings.host,
            port: connection.settings.port,
        },
        validationSchema: validation,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    })

    function toggleConnection() {

        if (connection.status.connected) {
            window.eel.GUIPauseInventory()
            setConnection({
                ...connection,
                status: {
                    ...connection.status,
                    connected: false,
                }
            });
        }
        else {
            const params = connection.settings;
            const filters = connection.filters;
            console.log("sending to reader:", connection.settings);
            window.eel.GUIStartInventory(params.host, parseInt(params.port), params.antennas, params.tari, params.power, params.mode);
            window.eel.changeFilters(filters.whitelist, filters.blacklist)
            setConnection({
                ...connection,
                status: {
                    connected: true,
                    started: Math.floor(Date.now() / 1000),
                }
            }, () => {
                console.log("new status:", connection.status);
            });
        }

        // setConnection({...connection, status: {...connection.status, started: Date.now() / 1000}});
    }

    function setSettings(params) {
        setConnection({ ...connection, settings: { ...connection.settings, ...params } });
    }

    return (
        <form>
            <h2>Reader Settings</h2>
            <FormGroup sx={{ mt: 0.5 }} >
                <div>
                    <TextField
                        disabled={connection.status.connected}
                        id="filled-basic"
                        label="Hostname"
                        variant="filled"
                        sx={{ mr: 1, width: '73%' }}
                        value={connection.settings.host}
                        onChange={(e) => setSettings({ host: e.target.value })}
                    />
                    <TextField
                        disabled={connection.status.connected}
                        id="filled-basic"
                        label="Port"
                        variant="filled"
                        sx={{ width: '24%' }}
                        value={connection.settings.port}
                        onChange={(e) => setSettings({ port: e.target.value })}
                    />
                </div>
            </FormGroup>

            {/* <form onSubmit={formik.handleSubmit}>
                <FormGroup sx={{ mt: 0.5 }} >
                    <div>
                        <TextField
                            disabled={connection.status.connected}
                            label="Hostname"
                            variant="filled"
                            sx={{ mr: 1, width: '73%' }}
                            value={formik.values.host}
                            onChange={formik.handleChange}
                            error={formik.touched.host && Boolean(formik.errors.host)}
                            helperText={formik.touched.host && formik.errors.host}
                        />
                        <TextField
                            disabled={connection.status.connected}
                            label="Port"
                            variant="filled"
                            sx={{ width: '24%' }}
                            value={formik.values.port}
                            onChange={formik.handleChange}
                            error={formik.touched.port && Boolean(formik.errors.port)}
                            helperText={formik.touched.port && formik.errors.port}
                        />
                    </div>
                </FormGroup>
            </form> */}

            {
                connection.settings.debugLogs &&
                <ReaderConsole />
            }
            <FormGroup sx={{ mt: 1 }}>
                <div className='form-group right top-space'>
                    <Tooltip title="Additional settings">
                        <IconButton variant='contained' size="small" disabled={connection.status.connected} onClick={() => setShowModal(true)}>
                            <Icon name="settings" />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant={connection.status.connected ? 'outlined' : 'contained'}
                        onClick={(e) => toggleConnection()}
                        color={connection.status.connected ? 'error' : 'primary'}
                        sx={{ width: '160px' }}
                        level={connection.status.connected ? "2" : "1"}
                    >
                        {connection.status.connected ? "Stop" : "Start"} Inventory
                    </Button>
                </div>
            </FormGroup>
            <Modal show={showModal} title="Additional Reader Settings" close={() => setShowModal(false)}>
                <div className='spacer-1'></div>
                <div>
                    <TextField
                        label="Tari"
                        variant="filled"
                        sx={{ mr: 1, width: '49%' }}
                        value={connection.settings.tari}
                        onChange={(e) => setSettings({ tari: e.target.value })}
                    />
                    <ChipList
                        color="primary"
                        label="Antennas"
                        sx={{ width: '49%', display: 'inline-block' }}
                        variant="filled"
                        value={connection.settings.antennas}
                        onChange={(value) => setSettings({
                            antennas: value.map(str => {
                                return Number(str);
                            })
                        })}
                    />
                </div>
                <div className='spacer-2'></div>
                <div>
                    <TextField
                        label="Power"
                        variant="filled"
                        sx={{ mr: 1, width: '49%' }}
                        value={connection.settings.power}
                        onChange={(e) => setSettings({ power: e.target.value })}
                    />
                    <TextField
                        label="Mode"
                        variant="filled"
                        sx={{ width: '49%' }}
                        value={connection.settings.mode}
                        onChange={(e) => setSettings({ mode: e.target.value })}
                    />
                </div>
                <div className='spacer-2'></div>
                <FormControlLabel

                    control={
                        <Checkbox
                            onClick={(e) => setSettings({ debugLogs: !connection.settings.debugLogs })}
                            checked={connection.settings.debugLogs}
                        />
                    }
                    label="Display all reader debugging logs"
                />
                <div className='form-group right top-space'>
                    <Button level="5" onClick={() => {
                        setSettings(
                            {
                                tari: 7140,
                                antennas: [1],
                                power: 0,
                                mode: 0,
                            }
                        );
                    }
                    }>
                        Reset
                    </Button>
                    <Button variant='contained' onClick={() => setShowModal(false)}>
                        Save
                    </Button>
                </div>
            </Modal>
        </form >

    )
}

export default Inventory;