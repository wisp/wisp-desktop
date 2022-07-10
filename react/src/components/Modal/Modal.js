import './Modal.scss';
import WindowBar from 'components/window/WindowBar/WindowBar';
import Icon from 'components/Icon/Icon';
import { Modal as M, Backdrop, Fade } from '@mui/material';
const Modal = (props) => {
    return (
        <M
            open={props.show}
            onClose={props.close}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 250,
            }}
        >
            <Fade in={props.show}>
            <div className='modal' style={{ width: props.width }}>
                <WindowBar
                    title={props.title}
                    right={
                        <Icon
                            small
                            name="close"
                            click={props.close}
                        />
                    }
                />
                <div className='modal-content'>
                    {props.children}
                </div>
            </div>
            </Fade>
        </M>
    );
}

export default Modal; 