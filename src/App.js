import './App.scss';
import React, { Component, useEffect } from 'react';
import ConnectionWindow from 'components/connection/ConnectionWindow/ConnectionWindow';
import Alerts from 'components/Alerts/Alerts';
import WindowManager from 'components/window/WindowManager/WindowManager';
import { EelListener } from 'dataManagement/EelListener';
import { ConnectionContext } from 'dataManagement/ConnectionContext';

const ConnectionStat = React.createContext({});

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      connected: false,
    };
  }

  componentDidMount() {

    // window.eel.expose(createAlert)
    // function createAlert(type, title, message) {
    //   console.log(type, title, message)
    // }

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
        <Alerts>
          <ConnectionContext>
            <EelListener>
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
      </div>
    );
  }
}

export { App, ConnectionStat };