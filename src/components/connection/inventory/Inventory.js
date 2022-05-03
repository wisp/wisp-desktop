import './Inventory.scss';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import ReactToolTip from 'react-tooltip';

import React, { useState, useContext } from 'react';
import { useAlert } from 'react-alert'
import Modal from '../../Modal';
import { Button } from '../../Button';
import Icon from '../../Icon';
import { Connection } from '../../../components/EelListener';


const Inventory = (props) => {

    const [connection, setConnection] = useContext(Connection);
    const [showModal, setShowModal] = useState(false);

    async function toggleConnection() {
        let success = false;
        if (connection.status.connected) {
            success = await window.eel.GUIPauseInventory()
        }
        else {
            const params = connection.settings;
            console.log(params);
            success = await window.eel.GUIStartInventory(params.host, parseInt(params.port), params.antennas, params.tari, params.power, params.mode)
        }

        if (success) {
            setConnection({ ...connection, status: { ...connection.status, connected: !connection.status.connected } });
        }
    }

    function setSettings(param) {
        setConnection({ ...connection, settings: { ...connection.settings, ...param } });
    }

    return (
        // <form>
        //     <div className='form-group stretch'>
        //         <label className="bias-80">
        //             <span>Hostname</span>
        //             <input
        //                 name="host"
        //                 type="text"
        //                 placeholder="speedway-XX-XX-XX.local"
        //                 value={connection.settings.host}
        //                 onInput={(e) => setSettings({ host: e.target.value })}
        //             />
        //         </label>
        //         <label>
        //             <span>Port</span>
        //             <input
        //                 name="port"
        //                 type="text"
        //                 placeholder="5084"
        //                 value={connection.settings.port}
        //                 onInput={(e) => setSettings({ port: e.target.value })}
        //             />
        //         </label>
        //     </div>
        //     <div className='form-group right top-space'>
        //         <Button level="3" click={() => setShowModal(true)}>
        //             <Icon name="settings" />
        //         </Button>
        //         <Modal show={showModal} title="Additional Reader Settings" close={() => setShowModal(false)}>
        //             <div className='form-group stretch'>
        //                 <label className='bias-50'>
        //                     <span>Tari</span>
        //                     <input
        //                         name="tari"
        //                         type="text"
        //                         placeholder="7140"
        //                         value={connection.settings.tari}
        //                         onInput={(e) => setSettings({ tari: e.target.value })}
        //                     />
        //                 </label>
        //                 <label className='bias-50'>
        //                     <span>Antennas</span>
        //                     <input
        //                         name="antennas"
        //                         type="text"
        //                         placeholder="1"
        //                         value={connection.settings.antennas}
        //                         onInput={(e) => setSettings({ antennas: e.target.value })}
        //                     />
        //                 </label>

        //             </div>

        //             <div className='form-group stretch'>
        //                 <label className='bias-50'>
        //                     <span>Power</span>
        //                     <input
        //                         name="power"
        //                         type="text"
        //                         placeholder="0"
        //                         value={connection.settings.power}
        //                         onInput={(e) => setSettings({ power: e.target.value })}
        //                     />
        //                 </label>

        //                 <label className='bias-50'>
        //                     <span>Transmit Mode</span>
        //                     <input
        //                         name="tx-mode"
        //                         type="text"
        //                         placeholder="0"
        //                         value={connection.settings.mode}
        //                         onInput={(e) => setSettings({ mode: e.target.value })}
        //                     />
        //                 </label>
        //             </div>
        //             <div className='form-group right top-space'>
        //                 <Button level="5" click={() => {
        //                     setSettings(
        //                         {
        //                             tari: 7140,
        //                             antennas: [1],
        //                             power: 0,
        //                             mode: 0,
        //                         }
        //                     );
        //                 }
        //                 }>
        //                     Reset
        //                 </Button>
        //                 <Button level="1" click={() => setShowModal(false)}>
        //                     Save
        //                 </Button>
        //             </div>
        //         </Modal>
        //         <Button
        //             style={{ width: '143px' }}
        //             level={connection.status.connected ? "2" : "1"}
        //             click={() => {
        //                 toggleConnection()
        //             }}
        //         >
        //             {connection.status.connected ? "Stop" : "Start"} Inventory
        //         </Button>
        //         {/* <Button level="2" click={() => alert.show('Now accepting tags from the reader', { title: 'Connected to reader' })}>
        //             <Icon name="close" />
        //         </Button> */}
        //     </div>
        // </form>
        // 
        <div>

            <Formik
                initialValues={connection.settings}
                validate={values => {
                    const errors = {};
                    if (!values.host) {
                        errors.host = 'Required';
                    } else if (
                        !/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(values.host)
                    ) {
                        errors.host = 'Invalid hostname';
                    }

                    if (!values.port) {
                        errors.port = 'Required';
                    } else if (!/^[0-9]+$/.test(values.port)) {
                        errors.port = 'Must be a number';
                    } else if (values.port < 1 || values.port > 65535) {
                        errors.port = 'Port must be between 1 and 65535';
                    }

                    if (!values.tari) {
                        errors.tari = 'Required';
                    } else if (!/^[0-9]+$/.test(values.tari)) {
                        errors.tari = 'Must be a number';
                    } else if (values.tari < 0 || values.tari > 99999) {
                        errors.tari = 'Tari must be between 0 and 99999';
                    }

                    if (!values.antennas) {
                        errors.antennas = 'Required';
                    } else if (!/^[1-9](,[1-9])*$/.test(values.antennas)) {
                        errors.antennas = 'Must be comma separated list';
                    }

                    // if (!values.power) {
                    //     errors.power = 'Required';
                    // } else if (!/^[0-9]+$/.test(values.power)) {
                    //     errors.power = 'Must be a number';
                    // }

                    // if (!values.mode) {
                    //     errors.mode = 'Required';
                    // } else if (!/^[0-9]+$/.test(values.mode)) {
                    //     errors.mode = 'Must be a number';
                    // }
                    
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values);
                    setSettings(values);
                    toggleConnection();
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className='form-group stretch'>
                            <label className="bias-80">
                                <span>Host</span>
                                <Field type="text" name="host" />
                            </label>
                            <label className="bias-20">
                                <span>Port</span>
                                <Field type="text" name="port" />
                            </label>
                        </div>
                        <div className='errors'>
                            <ErrorMessage name="host" component="div" />
                            <ErrorMessage name="port" component="div" />
                        </div>

                        <div className='form-group right top-space'>
                            <Button level="3" click={() => setShowModal(true)}>
                                <Icon name="settings" />
                            </Button>
                            <Button
                                type="submit"
                                style={{ width: '143px' }}
                                level={connection.status.connected ? "2" : "1"}
                            >
                                {connection.status.connected ? "Stop" : "Start"} Inventory
                            </Button>
                        </div>

                        <Modal show={showModal} title="Additional Reader Settings" close={() => setShowModal(false)}>
                            <div className='form-group stretch'>
                                <label className='bias-50'>
                                    <span>Tari</span>
                                    <Field type="text" name="tari" />
                                </label>
                                <label className='bias-50'>
                                    <span>Antennas</span>
                                    <Field type="text" name="antennas" />
                                </label>
                            </div>
                            <div className='form-group stretch'>
                                <label className='bias-50'>
                                    <span>Power</span>
                                    <Field type="text" name="power" />
                                </label>
                                <label className='bias-50'>
                                    <span>Mode</span>
                                    <Field type="text" name="mode" />
                                </label>
                            </div>
                            <div className='form-group right top-space'>
                                <Button level="5" click={() => {
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
                                <Button level="1" click={() => setShowModal(false)}>
                                    Save
                                </Button>
                            </div>

                        </Modal>
                    </Form>
                )}
            </Formik>
        </div>

    )
}

export default Inventory;