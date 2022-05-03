import './App.scss';
import React, { Component, useEffect } from 'react';
import ReactDOM from "react-dom";
import RecentTags from './widgets/RecentTags';
import ConnectionWindow from './components/connection/connectionWindow/ConnectionWindow';
import Alerts from './components/Alerts';
import WindowManager from './components/WindowManager';
import ImuDemo from './widgets/ImuDemo';
import { EelListener } from './components/EelListener'

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
            <EelListener>
              {/* <TagData.Provider value={this.state}> */}
              <ConnectionWindow />
              <div className="window-container">
                {/* <RecentTags /> */}
                {/* <ImuDemo /> */}
                <WindowManager>
                  <RecentTags />
                </WindowManager>
              </div>
              {/* </TagData.Provider> */}
            </EelListener>
          </Alerts>
      </div>
    );
  }
}

export { App, ConnectionStat };