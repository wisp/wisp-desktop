import './Modal.scss';
import WindowBar from './WindowBar';
import Icon from './Icon';

const Modal = (props) => {

    function stopPropagation(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!props.show) {
        return null;
    }
    return (
        <div className='modal' onClick={props.close}>
            <div className='modal-content' onClick={(e) => stopPropagation(e)}>
                <WindowBar
                    title={props.title}
                    right={
                        <Icon
                        name="close"
                        click={props.close}
                        />
                    }
                />
                <div className='window-content'>
                    {props.children}
                </div>
            </div>
        </div>
    );
}

export default Modal; 