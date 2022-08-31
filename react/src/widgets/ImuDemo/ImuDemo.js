import Window from 'components/window/Window/Window';
import './ImuDemo.scss'
import React, { useEffect, useState, useContext, useRef } from 'react';
import { TagDataRecent } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { Button, IconButton, Tooltip } from '@mui/material';

const pad = (num) => {
    const abs = Math.abs(num);
    const neg = num < 0;
    let s = abs.toFixed(1);
    while (s.length < 4) {
        s = '0' + s;
    }
    return (neg ? "\u2212" : "\u00A0") + s;
    
}

const ImuDemo = (props) => {
    return (
        <Window title="IMU Visualization" right={<Icon small name="close" click={props.onClose} />}>
            <ImuDemoInner />
        </Window>
    );
}

const ImuDemoInner = (props) => {
    const windowRef = useRef();
    const [angle, setAngle] = useState([0, 0, 0]);
    const [offsets, setOffsets] = useState([0, 0, 0]);

    const data = useContext(TagDataRecent).data;
    const keys = Object.keys(data);
    let accelTag = {seen: 0, formatted: {x: 0, y: 0, z: 0}};
    for(const key of keys) {
        const thisTag = data[key];
        if (thisTag.wispType === '0B') {
            if(accelTag.seen < thisTag.seen) {
                accelTag = thisTag;
            }
        }
    }

    useEffect(() => {
        if (accelTag) {
            const x = accelTag.formatted.x.value;
            const y = accelTag.formatted.y.value;
            const z = accelTag.formatted.z.value;
            
            const sign = (z > 0 ? 1 : -1);
            const miu = 1;
            const roll = Math.atan2(y, sign * Math.sqrt(z*z + miu*x*x)) * 180 / Math.PI;
            const yaw = Math.atan2(-x, Math.sqrt(y*y + z*z)) * 180 / Math.PI;

            const pitch = 0;

            setAngle([-roll, -pitch, -yaw]);
        }
    }, [accelTag]);

    function reset() {
        setOffsets([-angle[0], -angle[1], -angle[2]]);
    }

    return (
        <div ref={windowRef} style={{ width: '100%', height: '100%' }}>
                <div className="centered-narrow">
                    <Cube angle={[angle[0]+offsets[0], angle[1]+offsets[1], angle[2]+offsets[2]]} windowRef={windowRef} />
                    <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: 'IBM Plex Mono' }}>
                        {pad(angle[0] + offsets[0])}, {pad(angle[1] + offsets[1])}, {pad(angle[2] + offsets[2])}
                        <Tooltip title="Reset angle">
                            <IconButton
                                size="small"
                                sx={{ ml: 0.5 }}
                                onClick={() => reset()}>
                                <Icon name="loop" small />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
    );
}


const Cube = (props) => {
    const cubeRef = useRef();
    const cubeContainRef = useRef();

    useEffect(() => {
        const cube = cubeRef.current;
        cube.style.transform = `rotateX(${-props.angle[0]}deg) rotateY(${-props.angle[1]}deg) rotateZ(${-props.angle[2]}deg)`;
    }, [props.angle]);

    useEffect(() => {
        const cubeContain = cubeContainRef.current;
        function outputSize() {
            console.log(props.windowRef.current.offsetWidth);
            let maxWidth = props.windowRef.current.offsetWidth / 2;
            let maxHeight = props.windowRef.current.offsetHeight / 2;
            cubeContain.style.setProperty('--size', Math.min(maxHeight - 10, maxWidth) + "px");
            console.log(maxHeight, maxWidth);
        }
        outputSize()
        new ResizeObserver(outputSize).observe(props.windowRef.current)
    }, []);

    return (
        <div className="cube-container" ref={cubeContainRef} >
            <div className="cube" ref={cubeRef}>
                <div className="cube_face cube_face-front"><div className="cube-number-circle">1</div></div>
                <div className="cube_face cube_face-back"><div className="cube-number-circle">2</div></div>
                <div className="cube_face cube_face-right"><div className="cube-number-circle">3</div></div>
                <div className="cube_face cube_face-left"><div className="cube-number-circle">4</div></div>
                <div className="cube_face cube_face-top"><div className="cube-number-circle">5</div></div>
                <div className="cube_face cube_face-bottom"><div className="cube-number-circle">6</div></div>
            </div>
        </div>
    );
}

export default ImuDemo;