import './App.scss';
import React, { Component, useEffect } from 'react';
import ConnectionWindow from 'components/connection/ConnectionWindow/ConnectionWindow';
import Alerts from 'components/Alerts/Alerts';
import WindowManager from 'components/window/WindowManager/WindowManager';
import { EelListener } from 'dataManagement/EelListener';
import { ConnectionContext } from 'dataManagement/ConnectionContext';
import { theme } from 'global/palette';
import { ThemeProvider } from '@mui/material/styles';

const ConnectionStat = React.createContext({});

class App extends Component {
  render() {
    return (
      <div className="app">
        <ThemeProvider theme={theme}>
          <Alerts>
            <ConnectionContext>
              <EelListener eel={window.eel}>
                <ConnectionWindow />
                <div className="window-container">
                  <WindowManager/>
                </div>
              </EelListener>
            </ConnectionContext>
          </Alerts>
        </ThemeProvider>
      </div>
    );
  }
}

export { App, ConnectionStat };