import { useEffect, useState } from 'react';
import './Alerts.scss';
import Icon from './Icon.js';

import { transitions, positions, Provider as AlertProvider } from 'react-alert';

const AlertTemplate = ({ style, options, message, close }) => {
    let color = options.type === 'error' ? 'red' : 'green';
    color = options.type === 'info' ? '' : color;
    
    let iconName = options.icon;
    if (!options.icon) {
        iconName = options.type === 'error' ? 'error' : 'check';
        iconName = options.type === 'info' ? 'info' : iconName;
        console.log(iconName)
    } else {
        iconName = options.icon;
    }
    return (
        <div className={"alert " + color} style={style}>
            <div className="alert-icon">
                <Icon name={iconName} />
            </div>
            <div className="alert-message">
                <h3>{options.title}</h3>
                <p>{message}</p>
            </div>
            <button className="alert-close" onClick={close}>
                <Icon name="close" />
            </button>
        </div>
    )
}

const options = {
    position: positions.TOP_RIGHT,
    containerStyle: {
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
    },
    transitions: transitions.FADE,
    type: 'info',
    title: 'Alert',
    timeout: 5000,
}

const Alerts = (props) => {
    return (
        <AlertProvider template={AlertTemplate} {...options}>
            {props.children}
        </AlertProvider>
    );
}

export default Alerts; 