import Window from 'components/window/Window/Window';
import './AudioCapture.scss'
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { TagData } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { Button, IconButton, Tooltip } from '@mui/material';
import { useTable } from 'react-table'
import { getRelativeTime } from 'global/helperFunctions';

const AudioCapture = (props) => {
    return (
        <Window title="Audio Capture" right={<Icon small name="close" click={props.onClose} />}>
            <AudioCaptureInner />
        </Window>
    );
}

function Table({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    })

    // Render the UI for your table
    return (
        <div className="table-container AudioCapture">
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

const AudioCaptureInner = (props) => {
    const data = useContext(TagData).data;

    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate();
        }, 1000);
        return () => clearInterval(interval);
    }, [])

    const tag_candidates = data.filter(tag => (
        tag.wispType === 'AD'                                   // Only audio tags
        && tag.formatted.recording.value                        // Only tags with recordings
        && tag.formatted.seq_count.value == 255                 // Only complete recordings
    ));

    console.log("regenerating table");
    const tags = [];
    for (let i = 0; i < tag_candidates.length; i++) {
        if (!tags.some(tag => tag.formatted.recording.value === tag_candidates[i].formatted.recording.value)) {
            tags.unshift(tag_candidates[i]);
        }
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'Captured',
                accessor: 'seen',
                Cell: ({ cell: { value } }) => getRelativeTime(value),
                width: 150,
            },
            {
                Header: 'Recording',
                accessor: 'formatted.recording.value',
                Cell: ({ cell: { value } }) => <Audio b64={value} />,
                width: 400,
            }
        ],
        []
    );

    return (
        <div className='AudioCapture'>
            <Table columns={columns} data={tags} />
        </div>
    );
}

const Audio = (props) => {
    const audioElem = useRef(null);
    useEffect(() => {
        if (props.b64) {
            audioElem.current.load();
        }
    }, [props.b64]);
    return (
        <audio controls controlsList="noplaybackrate" ref={audioElem}>
            <source src={'data:audio/wav;base64,' + props.b64} type="audio/wav" />
        </audio>
    );
}

export default React.memo(AudioCapture);