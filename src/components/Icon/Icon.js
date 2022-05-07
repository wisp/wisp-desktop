import './Icon.scss';

const Icon = (props) => {
    if (props.name && props.name === '') {
        return (
            <span className={props.small ? "icon icon-empty small" : "icon"}></span>
        );
    }

    if (props.click) {
        return (
            <button onClick={props.click} className="icon-button">
                <span className={props.small ? "icon small" : "icon"}>
                    {props.name}
                </span>
            </button>
        );
    }
    return (
        <span className={props.small ? "icon small" : "icon"}>
            {props.name}
        </span>
    );
}

export default Icon;