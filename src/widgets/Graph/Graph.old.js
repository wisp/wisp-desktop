import './Graph.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import 'chartjs-adapter-moment';
// import { getRelativeTime, getFormattedData, getWispType } from 'global/helperFunctions';
import _ from "lodash";
import { TextField } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';


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
import { Line } from 'react-chartjs-2';

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
    const [graphOptions, setGraphOptions] = useState({
        dataSources: ['fdg'],
        minY: undefined,
        maxY: undefined,
        tagNum: 1000,
    });

    const context = useContext(TagData);

    let data = [];
    data = context.data.slice(-graphOptions.tagNum);

    return (

        <Window key={1} title="Graph" right={<Icon small name="close" click={props.onClose} />}>

            <div className='graph-body'>
                <div className="graph-options">
                    <ChipList
                        variant="filled"
                        color="primary"
                        label="Data Sources"
                        value={graphOptions.dataSources}
                        onChange={(value) => setGraphOptions({ ...graphOptions, dataSources: value })}
                        sx={{ mr: 1, mb: 3, width: 300 }}
                    />
                    <TextField
                        label="Y Min"
                        variant="filled"
                        value={graphOptions.minY}
                        onChange={(e) => setGraphOptions({ ...graphOptions, minY: e.target.value })}
                        sx={{ mr: 1, mb: 3, width: 70 }}
                    />
                    <TextField
                        label="Y Max"
                        variant="filled"
                        value={graphOptions.maxY}
                        onChange={(e) => setGraphOptions({ ...graphOptions, maxY: e.target.value })}
                        sx={{ mr: 1, width: 70 }}
                    />
                    <TextField
                        label="Tags"
                        variant="filled"
                        value={graphOptions.tagNum}
                        onChange={(e) => setGraphOptions({ ...graphOptions, tagNum: e.target.value })}
                        sx={{ mr: 1, width: 70 }}
                    />
                </div>
                <div className='graph-contain'>
                    <GraphBody data={data} options={graphOptions} />
                </div>
            </div>
        </Window>
    );
}

const GraphBody = (props) => {
    const [graphData, setGraphData] = useState({
        datasets: [
            {
                data: [],
            },
        ],
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0,
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        plugins: {
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
                }
                // time: {
                //     unit: 'milliseconds',
                // },
                // ticks: {
                //     callback: function (label, index, labels) {
                //         label = new Date(label).getTime();
                //         const currentTime = new Date().getTime();
                //         return (currentTime-label);
                //     }
                // }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                min: parseFloat(props.options.minY) != NaN ? props.options.minY : undefined,
                max: parseFloat(props.options.maxY) != NaN ? props.options.maxY : undefined,
            },
        },
    };

    const throttle = useCallback(
        _.throttle((newData) => {
            const dataSet = [];
            if (newData) {
                for (let i = 0; i < newData.length; i++) {
                    let graphPoints = {}
                    for (let j = 0; j < props.options.dataSources.length; j++) {
                        if (newData[i].formatted && newData[i].formatted[props.options.dataSources[j]]) {
                            graphPoints.x = newData[i].seen * 1000;
                            graphPoints.y = newData[i].formatted[props.options.dataSources[j]].value;
                        }
                    }
                    dataSet.push(graphPoints);
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

    return (
        <Line options={options} data={graphData} />
    );
}
export default Graph;