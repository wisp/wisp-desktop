import './Graph.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useCallback, memo } from 'react';
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
            <GraphInner defaultOptions={props.defaultOptions || undefined} />
        </Window >
    );
}

const defaultOptions = {
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
}

const GraphInner = (props) => {
    // const [graphOptions, setGraphOptions] = useState(props.defaultOptions || defaultOptions);
    const [graphOptions, setGraphOptions] = useState(defaultOptions);

    const alert = useAlert();

    const [showModal, setShowModal] = useState(false);

    const context = useContext(TagData);
    const data = context.data.slice(-graphOptions.tagNum);

    const recentContext = useContext(TagDataRecent);
    const recentData = recentContext.data;

    console.log(recentData);
    const varList = getVariableListFromRecentTags(recentData);

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
                <GraphBodyMemo data={data} options={graphOptions} />
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

const processTags = _.throttle((newData, options) => {
    const startTime = new Date();
    const dataSet = [];
    if (newData) {
        newData.forEach(tag => {
            if (tag.formatted && tag.formatted[options.ySource] && (tag.formatted[options.xSource] || options.timeAsX)) {
                let x;
                if (options.timeAsX) {
                    x = tag.seen * 1000;
                } else {
                    x = tag.formatted[options.xSource].value;
                }
                const y = tag.formatted[options.ySource].value;
                dataSet.push({ x, y });
            }
        });
    }
    const endTime = new Date();
    console.log(`processTags took ${endTime - startTime}ms`);
    return dataSet;
}, 1000);

const GraphBody = (props) => {
    const [graphData, setGraphData] = useState([]);
    const options = graphValidationSchema.validateSync(props.options);

    console.log("Graph Body Render");

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

    useEffect(() => {
        setGraphData(processTags(props.data, props.options));
    }, [props.data, props.options]);

    const dataObj = {
        datasets: [
            {
                data: graphData,
                borderColor: 'gray',
                backgroundColor: 'lightgray',
            },
        ],
    }

    return (<Line id="chart" options={chartJsOptions} data={dataObj} />);
}
const GraphBodyMemo = memo(GraphBody);

export default Graph;