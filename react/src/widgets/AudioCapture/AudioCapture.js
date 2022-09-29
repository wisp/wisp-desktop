import Window from 'components/window/Window/Window';
import './AudioCapture.scss'
import React, { useEffect, useState, useContext, useRef, Fragment } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { Button, IconButton, Tooltip } from '@mui/material';

const AudioCapture = (props) => {
    return (
        <Window title="Audio Capture" right={<Icon small name="close" click={props.onClose} />}>
            <AudioCaptureInner />
        </Window>
    );
}

const AudioCaptureInner = (props) => {
    let recordings = [];
    const data = useContext(TagData).data;

    for (const tag of data) {
        if (tag.wispType === 'AD' && tag.formatted.recording.value) {
            // Don't add it if it's already in the list
            if (!recordings.includes(tag.formatted.recording.value)) {
                if (tag.formatted.seq_count.value == 255) {
                    // This is a new, complete image, so add it to the list
                    recordings.push(tag.formatted.recording.value);
                }
            }
        }
    }

    return (
        <div className='AudioCapture'>
            {recordings.map((recording, index) => {
                return (
                    <div key={index} className="recording">
                        <audio controls controlsList="noplaybackrate">
                            <source src={'data:audio/wav;base64,' + recording} type="audio/wav" />
                        </audio>
                    </div>
                );
            })}
        </div>
    );
}

export default AudioCapture;