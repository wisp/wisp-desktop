import './Graph.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useRef, memo } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';

import _ from "lodash";
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';
import Modal from 'components/Modal/Modal';
import GraphModal from './GraphModal';
import * as yup from 'yup';

import { getVariableListFromRecentTags } from 'global/helperFunctions';
import { useAlert } from 'react-alert';

import uPlot from "uplot";
// import "uplot/dist/uPlot.min.css";

import UPlotReact from "uplot-react";


const Graph = (props) => {
    return (
        <Window title="Chart" right={<Icon small name="close" click={props.onClose} />}>
            <GraphInner randKey={props.randKey} />
        </Window >
    );
}

const defaultOptions = {
    chartStyle: 'line',
    tagNum: 2000,
    timeAsX: true,
    xSource: 'seen',
    minX: undefined,
    maxX: undefined,
    ySource: 'value',
    minY: undefined,
    maxY: undefined,
    plotIdsSeparate: true,
}

const GraphInner = (props) => {
    // const [graphOptions, setGraphOptions] = useState(props.defaultOptions || defaultOptions);
    const [graphOptions, setGraphOptions] = useState(defaultOptions);
    console.log("Graph Inner Render" + props.randKey);
    console.log("Graph Inner Render" + JSON.stringify(graphOptions));

    const alert = useAlert();

    const [showModal, setShowModal] = useState(false);

    const context = useContext(TagData);
    const data = context.data.slice(-graphOptions.tagNum);

    const recentContext = useContext(TagDataRecent);
    const recentData = recentContext.data;

    const graphBodyRef = useRef(null);

    console.log(recentData);
    const varList = getVariableListFromRecentTags(recentData);

    function copyToClipboard() {
        const canvas = document.querySelector('.' + props.randKey + ' .uplot canvas');
        if (canvas) {
            canvas.toBlob(function (blob) {
                const item = new window.ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]);
                alert.success('Copied to clipboard', { icon: 'copy' });
            });
        }
    }

    function download() {
        const canvas = document.querySelector('.' + props.randKey + ' .uplot canvas');
        if (canvas) {
            canvas.toBlob(function (blob) {
                const item = new window.Blob([blob], { type: 'image/png' });
                const url = window.URL.createObjectURL(item);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'chart.png';
                link.click();
                window.URL.revokeObjectURL(url);
                alert.success('Downloaded', { icon: 'download' });
            });
        }
    }

    return (
        <div className={'graph-body' + ' ' + props.randKey}>
            <GraphBody data={data} options={graphOptions} randKey={props.randKey} key={props.randKey}/>
            <div className="graph-options" style={{ paddingTop: 20 }}>
                <div className="form-group stretch">
                    {/* <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowModal(true)}
                    >
                        Options
                    </Button> */}
                    <GraphModal graphOptions={[graphOptions, setGraphOptions]} varList={varList} key={props.randKey}/>

                    <span style={{ flexGrow: 1, display: "flex", justifyContent: 'flex-end' }}>
                        <IconButton
                            variant='contained'
                            size="small"
                            sx={{ width: 55 }}
                            onClick={() => copyToClipboard()}
                        >
                            <Icon small name="copy" />
                        </IconButton>
                        <IconButton
                            variant='contained'
                            size="small"
                            sx={{ width: 55 }}
                            onClick={() => download()}
                        >
                            <Icon small name="download" />
                        </IconButton>
                    </span>
                    {/* <Modal
                        show={showModal}
                        title="Chart Options"
                        // width={400}
                        close={() => setShowModal(false)}
                    >
                        <GraphModal graphOptions={[graphOptions, setGraphOptions]} varList={varList} close={() => setShowModal(false)} />
                    </Modal> */}
                </div>
            </div>
        </div >
    )
}
const graphValidationSchema = yup.object().shape({
    chartStyle: yup.string().oneOf(['line', 'scatter']),
    tagNum: yup.number().transform(value => (isNaN(value) ? 1 : value)).transform(value => (value > 1000 ? 1000 : value)).transform(value => (value < 1 ? 1 : value)).min(1).max(1000),
    timeAsX: yup.boolean(),
    xSource: yup.string(),
    minX: yup.number().transform(value => (isNaN(value) ? undefined : value)),
    maxX: yup.number().transform(value => (isNaN(value) ? undefined : value)),
    ySource: yup.string(),
    minY: yup.number().transform(value => (isNaN(value) ? undefined : value)),
    maxY: yup.number().transform(value => (isNaN(value) ? undefined : value)),
    plotIdsSeparate: yup.boolean(),
});

const processTags = _.throttle((newData, options) => {
    const startTime = new Date();
    const x = [];
    const y = [];
    if (newData) {
        newData.forEach(tag => {
            if (tag.formatted && tag.formatted[options.ySource] && (tag.formatted[options.xSource] || options.timeAsX)) {
                if (options.timeAsX) {
                    x.push(tag.seen);
                } else {
                    x.push(tag.formatted[options.xSource].value);
                }
                y.push(tag.formatted[options.ySource].value);
            }
        });
    }
    const endTime = new Date();
    console.log(`processTags took ${endTime - startTime}ms`);
    return [x, y];
}, 100);

const updateSize = _.throttle((width, height, setGraphOptions) => {
    setGraphOptions(prev => ({ ...prev, width, height }));
}, 100);

const GraphBody = (props) => {
    const [graphData, setGraphData] = useState([]);
    const [graphOptions, setGraphOptions] = useState({
        width: 400,
        height: 300,

        legend: {
            show: false,
        },
        series: [
            {

            },
            {
                points: { show: false },
                stroke: "gray",
                width: 2,
            }
        ],
        scales: {
            x: {
                time: props.options.timeAsX,
                range: [props.options.minX || null, props.options.maxX || null],
            },
            y: {
                range: [props.options.minY || null, props.options.maxY || null],
            }
        },
        axes: [
            {},
            {
                labelFont: "13px 'IBM Plex Mono'",
                font: "13px 'IBM Plex Mono'",
                label: props.options.ySourceStr,
            }
        ]
    });

    useEffect(() => {
        setGraphOptions({
            width: 400,
            height: 300,
    
            legend: {
                // show: false,
                position: 'top',
            },
            series: [
                {   
                    label: "Time",
                    value: (self, unix) => {
                        const time = new Date(unix * 1000);
                        return time.toLocaleTimeString();
                    }
                },
                {
                    points: { show: false },
                    stroke: "gray",
                    width: 2,

                    label: (props.options.ySourceStr ? props.options.ySourceStr.replace(/ *\([^)]*\) */g, "") : ""),
                    value: (self, rawValue) => Math.round(rawValue * 100) / 100,
                }
            ],
            scales: {
                x: {
                    time: true,
                },
                y: {
                    range: [props.options.minY || null, props.options.maxY || null],
                }
            },
            axes: [
                {
                    labelFont: "13px 'IBM Plex Mono'",
                    font: "13px 'IBM Plex Mono'"
                },
                {
                    labelFont: "13px 'IBM Plex Mono'",
                    font: "13px 'IBM Plex Mono'",
                    label: props.options.ySourceStr
                }
            ]
        })
    } , [props.options]);

    const options = graphValidationSchema.validateSync(props.options);
    const graphContainRef = useRef(null);

    console.log("Graph Body Render");

    // if (!options.timeAsX) {
    //     uPlotOptions.scales.x = {
    //         time: false,
    //         range: [props.options.minX, props.options.maxX],
    //     }
    // }

    // const setSize = () => {
    //     _.throttle(() => {
    //         setGraphOptions(prev => ({ ...prev, width: entry.contentRect.width, height: entry.contentRect.height }));
    //     })();
    // }

    useEffect(() => {
        const myObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                updateSize(entry.contentRect.width, entry.contentRect.height, setGraphOptions);
            });
        });
        myObserver.observe(graphContainRef.current);
        return () => myObserver.disconnect();
    }, [props.options]);

    useEffect(() => {
        setGraphData(processTags(props.data, props.options));
    }, [props.data, props.options]);

    return (
        <div className={'graph-contain' + (graphData.length === 0 ? "" : " empty")} ref={graphContainRef}>
            {props.randKey}
            <UPlotReact
                // key={props.randKey}
                options={graphOptions}
                data={graphData}
                onDelete={(/* chart: uPlot */) => console.log("Deleted from class " + props.randKey)}
                onCreate={(/* chart: uPlot */) => console.log("Created from class" + props.randKey)}
            />
        </div>
    );
}

export default Graph;