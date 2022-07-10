import './Window.scss';
import WindowBar from 'components/window/WindowBar/WindowBar';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';


const Window = (props) => {

    return (
        <div className="window">
            
                <WindowBar title={props.title} right={props.right} />
                
                <div className="window-content">
                    <ErrorBoundary>
                    {props.children}
                    </ErrorBoundary>
                </div>
            
        </div>
    );
}

export default Window;