import Window from 'components/window/Window/Window';
import './ImgCapture.scss'
import React, { useEffect, useState, useContext, useRef } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { Button, IconButton, Tooltip } from '@mui/material';

const ImgCapture = (props) => {
    return (
        <Window title="Image Capture" right={<Icon small name="close" click={props.onClose} />}>
            <ImgCaptureInner />
        </Window>
    );
}

const ImgCaptureInner = (props) => {
    const [images, setImages] = useState([]);
    const [currImage, setCurrImage] = useState(0);
    const data = useContext(TagData).data;
    for (const tag of data) {
        if (tag.wispType === 'CA' && tag.formatted.image.value) {
            if (!images.includes(tag.formatted.image.value)) {
                setImages([...images, tag.formatted.image.value]);
            }
        }
    }

    useEffect(() => {
        if (images.length > 0) {
            setCurrImage(images.length - 1);
        }
    }, [images]);

    return (
        <div className='ImageCapture'>
            <div className='btn-group'>
                <Button
                    variant='outlined'
                    color='primary'
                    sx={{ height: '150px', minWidth: '0', width: '0' }}
                    disabled={currImage <= 0}
                    onClick={() => {
                        setCurrImage(currImage - 1);
                    }}
                >
                    <Icon small name='arrow_back_ios' />
                </Button>
                {
                    images.length > 0 ?
                    <img src={"data:image/png;base64," + images[currImage]} />
                        :
                        (<div className='no-image'>
                            <p>No image captured</p>
                        </div>)
                }
                <Button
                    variant='outlined'
                    color='primary'
                    sx={{ height: '150px', minWidth: '0', width: '0' }}
                    disabled={currImage === images.length - 1}
                    onClick={() => {
                        setCurrImage(currImage + 1);
                    }}
                >
                    <Icon small name='arrow_forward_ios' />
                </Button>
            </div>
        </div>
    );
}

export default ImgCapture;

// {images.map((image, index) => {
            //     return (
            //         <div className='img-contain' key={index}>
            //             <img src={"data:image/png;base64," + image} />
            //         </div>
            //     );
            // })}