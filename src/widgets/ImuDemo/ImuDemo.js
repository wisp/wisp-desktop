import Window from 'components/window/Window/Window';
import './ImuDemo.scss'
import React, { useEffect, useState, useContext, useRef } from 'react';
// import { TagData } from '../App';
import Icon from 'components/Icon/Icon';



const ImuDemo = (props) => {
    const cubeRef = useRef();
    const cubeContainRef = useRef();
    const windowRef = useRef();
    const [angle, setAngle] = useState([-43, 30, 0]);

    let scaleNum = 1;

    useEffect(() => {
        const cube = cubeRef.current;
        cube.style.transform = `rotateX(${angle[0]}deg) rotateY(${angle[1]}deg) rotateZ(${angle[2]}deg)`;
    }, [angle]);

    useEffect(() => {
        const cubeContain = cubeContainRef.current;
        // cubeContain.addEventListener('resize', (e) => {
        //     scaleNum = cubeContain.clientWidth / 100;
        //     console.log(cubeContain.clientWidth);
        // });

        function outputSize() {
            console.log(windowRef.current.offsetWidth);
            let maxWidth = windowRef.current.offsetWidth / 2;
            let maxHeight = windowRef.current.offsetHeight / 2;
            cubeContain.style.setProperty('--size', Math.min(maxHeight, maxWidth) + "px");
            console.log(maxHeight, maxWidth);
        }
        outputSize()
        new ResizeObserver(outputSize).observe(windowRef.current)

    }, [angle]);


    return (
        <Window title="IMU Visualization" right={<Icon small name="close" click={props.onClose} />}>
            <div ref={windowRef} style={{width: '100%', height: '100%'}}>
            <div className="centered-narrow">
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
                <div style={{textAlign: 'center', marginTop: '10px'}}>-43°, 30°, 0°</div>
            </div>
            </div>
        </Window>
    );
}

export default ImuDemo;