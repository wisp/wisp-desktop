import Window from 'components/window/Window/Window';
import './ImgCapture.scss'
import React, { useState, useContext } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { Button } from '@mui/material';
import { getRelativeTime } from 'global/helperFunctions';

const ImgCapture = (props) => {
    return (
        <Window title="Image Capture" right={<Icon small name="close" click={props.onClose} />}>
            <ImgCaptureInner />
        </Window>
    );
}

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const ImgCaptureInner = (props) => {
    const data = useContext(TagData).data;
    let images = [{ img: null, time: null, state: null }];
    const [currImage, setCurrImage] = useState(0);

    for (const tag of data) {
        // Ensures its a camera tag
        if (tag.formattedType === 'Camera' && tag.formatted.image.value) {
            // Ensures the image is not already in the list
            // if (!images.includes(tag.formatted.image.value)) {
            // Checks if the image is complete
            // if (tag.formatted.state.value === 'complete') {
            //     // This is a new, complete image, so add it to the front of the list
            //     images.unshift({
            //         img: tag.formatted.image.value,
            //         time: tag.seen,
            //         status: capitalize(tag.formatted.state.value),
            //     });
            // } else {
            //     // Update the working image if it's still in progress
            //     images[0].img = tag.formatted.image.value;
            //     images[0].status = capitalize(tag.formatted.state.value);
            //     images[0].time = tag.seen;
            // }

            // images with status "incoming" arrive sequentially, replacing the current image. At the end of the sequence, the image is complete.
            // and the image should not be changed
            images[0].state = capitalize(tag.formatted.state.value);
            images[0].time = tag.seen;
            images[0].img = tag.formatted.image.value;

            if (tag.formatted.state.value === 'complete') {
                images.unshift({
                    img: null,
                    time: null,
                    state: null,
                });
            }
        }
    }

    // remove duplicates and null images
    var renderedImages = [...new Set(images)];
    renderedImages = renderedImages.filter((image) => image.img !== null);

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
                <div className='img-contain'>
                    {
                        renderedImages[currImage] && renderedImages[currImage].img ?
                            (<div style={{ flexGrow: '1' }}>
                                {/* <h2>People Found: {counts[currImage]}</h2> */}
                                <img src={"data:image/png;base64," + renderedImages[currImage].img} />
                            </div>)
                            :
                            (<div className='no-image'>
                                <p>No image captured</p>
                            </div>)
                    }
                    <div className='status-group' style={{marginTop: 20}}>
                        <div className='status'>
                            <div className='label'>Captured</div>
                            <div className='value'>{renderedImages[currImage] ? new Date(renderedImages[currImage].time * 1000).toLocaleString() : ''}</div>
                        </div>
                        <div className='status'>
                            <div className='label'>Status</div>
                            <div className='value'>{renderedImages[currImage] ? renderedImages[currImage].state : ''}</div>
                        </div>
                    </div>
                </div>
                <Button
                    variant='outlined'
                    color='primary'
                    sx={{ height: '150px', minWidth: '0', width: '0' }}
                    disabled={currImage >= renderedImages.length - 1}
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