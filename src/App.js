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

  constructor(props) {
    function createAlert(type, title, message) {
      console.log(type, title, message)
    }
    window.eel.expose(createAlert)

    super(props);
    this.state = {
      tags: [],
      connected: false,
    };
  }

  componentDidMount() {

    
    

    // window.eel.expose(acceptTag)
    // function acceptTag(tagData) {
    //   console.log(tagData)
    //   // this.setState({
    //   //   tags: ["...this.state.tags, tagData"]
    //   // });
    // }
  }

  render() {
    return (
      <div className="app">
        <ThemeProvider theme={theme}>
          <Alerts>
            <ConnectionContext>
              <EelListener eel={window.eel}>
                {/* <TagData.Provider value={this.state}> */}
                <ConnectionWindow />
                <div className="window-container">
                  {/* <RecentTags /> */}
                  {/* <ImuDemo /> */}
                  <WindowManager>
                  </WindowManager>
                </div>
                {/* </TagData.Provider> */}
              </EelListener>
            </ConnectionContext>
          </Alerts>
        </ThemeProvider>
      </div>
    );
  }
}

export { App, ConnectionStat };