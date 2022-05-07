import './Graph.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import 'chartjs-adapter-moment';
// import { getRelativeTime, getFormattedData, getWispType } from 'global/helperFunctions';
import _ from "lodash";


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

export const options = {
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
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: -100,
            max: 0,
        },
    },
};

// export const data = {
//     labels,
//     datasets: [
//       {
//         label: 'Dataset 1',
//         data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//         borderColor: 'rgb(255, 99, 132)',
//         backgroundColor: 'rgba(255, 99, 132, 0.5)',
//       },
//       {
//         label: 'Dataset 2',
//         data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//         borderColor: 'rgb(53, 162, 235)',
//         backgroundColor: 'rgba(53, 162, 235, 0.5)',
//       },
//     ],
//   };

const Graph = (props) => {
    const context = useContext(TagData);

    let data = [];
    data = context.data;

    return (
        <Window key={1} title="RSSI Graph" right={<Icon small name="close" click={props.onClose} />}>
            <div className='graphContiner' style={{height: '280px'}}>
                <GraphBody data={data} />
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

    const throttle = useCallback(
        _.throttle((newData) => {
            let data = [];
            const dataSet = [];
            if (newData) {
                data = newData;
                for (let i = 0; i < data.length; i++) {
                    dataSet.push({
                        x: data[i].seen,
                        y: data[i].rssi,
                    });
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
        }, 500),
        []
    );

    useEffect(() => throttle(props.data), [props.data]);




    return (
        <Line options={options} data={graphData} />
    );
}
export default Graph;