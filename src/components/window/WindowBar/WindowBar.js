import './WindowBar.scss';

const WindowBar = (props) => {
    return (
        <div className="window-bar">
            <div className="title">
                {props.title}
            </div>
            <div className="right">
                {props.right}
            </div>
        </div>
    );
}

export default WindowBar;