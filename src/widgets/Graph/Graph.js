import './Graph.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import 'chartjs-adapter-moment';
// import { getRelativeTime, getFormattedData, getWispType } from 'global/helperFunctions';
import _ from "lodash";
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';
import Modal from 'components/Modal/Modal';
import GraphModal from './GraphModal';
import * as yup from 'yup';
import { Line, Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getVariableListFromRecentTags } from 'global/helperFunctions';
import { useAlert } from 'react-alert';


ChartJS.register(
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


const Graph = (props) => {
    return (
        <Window key={1} title="Chart" right={<Icon small name="close" click={props.onClose} />}>
            <GraphInner />
        </Window >
    );
}

const GraphInner = (props) => {
    const [graphOptions, setGraphOptions] = useState({
        chartStyle: 'line',
        tagNum: 500,
        timeAsX: true,
        xSource: 'seen',
        minX: undefined,
        maxX: undefined,
        ySource: 'value',
        minY: undefined,
        maxY: undefined,
        plotIdsSeparate: true,
    });

    const alert = useAlert();

    const [showModal, setShowModal] = useState(false);

    const context = useContext(TagData);
    const data = context.data.slice(-graphOptions.tagNum);

    const recentContext = useContext(TagDataRecent);
    const recentData = recentContext.data;

    console.log(recentData);
    const varList = getVariableListFromRecentTags(recentData);
    // const varList = ['sin', 'cos'];

    // function toBlob

    function copyToClipboard() {
        const canvas = document.getElementById('chart');
        if (canvas) {
            canvas.toBlob(function (blob) {
                const item = new window.ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]);
                alert.success('Copied to clipboard', { icon: 'copy' });
            });
        }
    }

    function download() {
        const canvas = document.getElementById('chart');
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
        <div className='graph-body'>
            <div className='graph-contain'>
                <GraphBody data={data} options={graphOptions} varList={varList} />
            </div>
            <div className="graph-options" style={{ paddingTop: 20 }}>
                <div className="form-group stretch">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowModal(true)}
                    >
                        Options
                    </Button>

                    <span style={{ width: '100%', display: "flex", justifyContent: 'flex-end' }}>
                        <IconButton
                            variant='contained'
                            size="small"
                            onClick={() => copyToClipboard()}
                        >
                            <Icon small name="copy" />
                        </IconButton>
                        <IconButton
                            variant='contained'
                            size="small"
                            onClick={() => download()}
                        >
                            <Icon small name="download" />
                        </IconButton>
                    </span>
                    <Modal
                        show={showModal}
                        title="Chart Options"
                        // width={400}
                        close={() => setShowModal(false)}
                    >
                        <GraphModal graphOptions={[graphOptions, setGraphOptions]} varList={varList} close={() => setShowModal(false)} />
                    </Modal>
                </div>
            </div>
        </div>
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

const GraphBody = (props) => {
    const [graphData, setGraphData] = useState({
        datasets: [
            {
                data: [],
            },
        ],
    });

    const options = graphValidationSchema.validateSync(props.options);

    let chartJsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        events: [],
        animation: {
            duration: 0,
        },
        hover: {
            animationDuration: 0
        },
        responsiveAnimationDuration: 0,
        plugins: {
            tooltip: { enabled: false },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                type: 'time',
                bounds: 'data',
                suggestedMax: 0,
                gridLines: {
                    offsetGridLines: false
                },
                ticks: {
                    source: 'data',
                    autoSkip: true,
                    maxTicksLimit: 5,
                    maxRotation: 0,
                    alignment: 'end'
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                min: options.minY,
                max: options.maxY,
            },
        },
    };

    if (!options.timeAsX) {
        chartJsOptions.scales.x = {
            type: 'linear',
            min: options.minX,
            max: options.maxX,
        }
    }

    const throttle = useCallback(
        _.throttle((newData) => {
            const dataSet = [];
            if (newData) {
                for (let i = 0; i < newData.length; i++) {
                    let graphPoint;
                    if (newData[i].formatted) {
                        if (!options.timeAsX) {
                            graphPoint = {
                                x: newData[i].formatted[options.xSource] ? newData[i].formatted[options.xSource].value : 0,
                                y: newData[i].formatted[options.ySource] ? newData[i].formatted[options.ySource].value : 0,
                            };
                        }
                        else {
                            graphPoint = {
                                x: newData[i].seen * 1000,
                                y: newData[i].formatted[options.ySource] ? newData[i].formatted[options.ySource].value : undefined,
                            };
                        }
                        dataSet.push(graphPoint);
                    }
                }
            }

            const dataObj = {
                datasets: [
                    {
                        data: dataSet,
                        borderColor: 'gray',
                        backgroundColor: 'lightgray',
                    },
                ],
            };
            setGraphData(dataObj);
        }, 1000),
        [props.options]
    );

    useEffect(() => {
        throttle(props.data)
    }, [props.data, props.options]);

    if (props.options.chartStyle === 'line') {
        return (<Line id="chart" options={chartJsOptions} data={graphData} />);
    } else if (props.options.chartStyle === 'scatter') {
        return (<Scatter id="chart" options={chartJsOptions} data={graphData} />);
    }
}

export default Graph;