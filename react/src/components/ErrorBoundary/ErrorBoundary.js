import React from 'react';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div className="error-container">
                    <div style={{  }}>
                        <h2>A rendering error occurred</h2>
                        {/* <button className='retry' onClick={()=>{this.forceUpdate()}}>RETRY</button> */}
                        <p>
                            <details className='error-details'>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </details>
                        </p>
                    </div>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;