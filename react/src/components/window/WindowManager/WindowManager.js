import './WindowManager.scss';

// import ResponsiveGridLayout from "react-grid-layout";
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

import { Responsive, WidthProvider } from "react-grid-layout";
import { useEffect, useRef, useState, cloneElement } from 'react';
import Icon from 'components/Icon/Icon';
import ButtonMenu from 'components/ButtonMenu/ButtonMenu'
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import widgets from 'widgets/widgets.js';
import { MenuItem, ListItemIcon, Button } from '@mui/material';

const GridLayout = WidthProvider(Responsive);

const WindowManager = (props) => {
    // console.log("rendering WindowManager");
    const element = useRef(null);

    const [windows, setWindows] = useState([]);

    function addWindow(window) {
        // find the maximum key and add 1
        const maxKey = windows.reduce((max, p) => p.key > max ? p.key : max, 0);
        window.key = maxKey + 1;
        setWindows([...windows, window]);
    }

    function removeWindow(key) {
        setWindows(windows.filter(window => window.key !== key));
    }

    // function saveLayout() {
    //     console.log("Saving layout");
    //     console.log("Windows: ", JSON.stringify(windows))
    // }


    useEffect(() => {
        console.log(element.current.offsetWidth);
        var ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                window.dispatchEvent(new Event('resize'));
            }
        });
        ro.observe(element.current);
    }, []);

    return (
        <div ref={element} className="window-manager-container">
            <GridLayout
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 18, md: 12, sm: 9, xs: 6, xxs: 3 }}
                className="layout"
                rowHeight={50}
                autoSize={false}
                draggableCancel=".window-content, .modal"
                draggableHandle=".window-bar"
                margin={[15, 15]}
            >

                {windows.map(window => {
                    const cloned = cloneElement(
                        window.element,
                        { onClose: () => removeWindow(window.key), defaultOptions: window.options, key: window.key, randKey: window.key }
                    );

                    return (
                        <div key={window.key} data-grid={window}>
                            {cloned}
                        </div>
                    );
                })}
            </GridLayout>

            <div style={{ position: 'fixed', bottom: '15px', right: '15px' }}>
                {/* <ButtonDropdown
                    size="2"
                    level="1"
                    mouseEnter={() => addWindow({ x: 0, y: 0, w: 3, h: 8, element: <ImuDemo /> })}
                    dropdown={
                        <div>
                            <Button size="1" level="4" click={() => addWindow({ x: 0, y: -1, w: 3, h: 8, element: <ImuDemo /> })}>IMU Visualization</Button>
                            <Button size="1" level="4" click={() => addWindow({ x: 0, y: -1, w: 10, h: 5, element: <RecentTags /> })}>Recent Tags</Button>
                            <Button size="1" level="4" click={() => addWindow({ x: 0, y: -1, w: 6, h: 8, element: <Graph /> })}>RSSI Graph</Button>
                        </div>
                    }
                >
                    <Icon name="add" />
                </ButtonDropdown> */}
                <ButtonMenu
                    buttonLabel={(<span><Icon name="add" />&nbsp;&nbsp;Add Widget</span>)}
                >
                    {
                        widgets.map(widget => {
                            return (
                                <MenuItem onClick={() => addWindow({
                                    x: 0, y: -1,
                                    w: widget.defaultSize[0],
                                    h: widget.defaultSize[1],
                                    element: widget.component,
                                    minW: widget.minSize[0] || 1,
                                    minH: widget.minSize[1] || 1,
                                    maxW: widget.maxSize[0] || Infinity,
                                    maxH: widget.maxSize[1] || Infinity,
                                    title: widget.title,
                                })}>
                                    <ListItemIcon>
                                        <Icon name={widget.icon} />
                                    </ListItemIcon>
                                    {widget.title}
                                </MenuItem>
                            )
                        })
                    }
                </ButtonMenu>
                
                {/* <Button size="2" level="1" onClick={() => saveLayout()}>
                    <Icon name="add" />
                </Button>
                <Button size="2" level="1" onClick={() => loadLayout()}>
                    <Icon name="minus" />
                </Button> */}

                {/* <Button onClick={(e) => choosePreset('Camera Capture', addWindow)}>
                    Image Viewer
                </Button> */}

            </div>
        </div>
    );
}

// const choosePreset = (key, addWindow) => {
//     let widget;
//     switch (key) {
//         case 'Camera Capture':
//             addWindow({
//                 x: 0, y: 0,
//                 w: 18,
//                 h: 5,
//                 element: widgets.RecentTags.component,
//                 minW: widgets.RecentTags.minSize[0] || 1,
//                 minH: widgets.RecentTags.minSize[1] || 1,
//                 maxW: widgets.RecentTags.maxSize[0] || Infinity,
//                 maxH: widgets.RecentTags.maxSize[1] || Infinity,
//                 title: widgets.RecentTags.title,
//             });
//             addWindow({
//                 x: 0, y: 5,
//                 w: widgets.Gauge.defaultSize[0],
//                 h: widgets.Gauge.defaultSize[1],
//                 element: widgets.Gauge.component,
//                 minW: widgets.Gauge.minSize[0] || 1,
//                 minH: widgets.Gauge.minSize[1] || 1,
//                 maxW: widgets.Gauge.maxSize[0] || Infinity,
//                 maxH: widgets.Gauge.maxSize[1] || Infinity,
//                 title: widgets.Gauge.title,

//                 options: {
//                     dataSource: 'seq_count',
//                 }
//             });
//             addWindow({
//                 x: 0, y: 5,
//                 w: widgets.ImgCapture.defaultSize[0],
//                 h: widgets.ImgCapture.defaultSize[1],
//                 element: widgets.ImgCapture.component,
//                 minW: widgets.ImgCapture.minSize[0] || 1,
//                 minH: widgets.ImgCapture.minSize[1] || 1,
//                 maxW: widgets.ImgCapture.maxSize[0] || Infinity,
//                 maxH: widgets.ImgCapture.maxSize[1] || Infinity,
//                 title: widgets.ImgCapture.title,
//             });
//             break;
//         default:
//             break;
//     }
// }

export default WindowManager;