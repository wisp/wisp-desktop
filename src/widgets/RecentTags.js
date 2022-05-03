import Window from '../components/Window'
import './RecentTags.scss'
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTable, useSortBy } from 'react-table';
import { TagDataRecent } from '../components/EelListener';
import Icon from '../components/Icon';
import { getRelativeTime, getFormattedData, getWispType } from '../global/helperFunctions';



const RecentTags = (props) => {
    const context = useContext(TagDataRecent);
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate();
        }, 1000);
        return () => clearInterval(interval);
    }, [])


    const columns = React.useMemo(
        () => [
            {
                Header: 'Last Seen',
                accessor: 'seen',
                Cell: ({ cell: { value } }) => getRelativeTime(value),
            },
            {
                Header: 'Count',
                accessor: 'count',
            },
            {
                Header: 'EPC',
                accessor: 'epc',
            },
            {
                Header: 'Tag Type',
                accessor: 'wispType',
                Cell: ({ cell: { value } }) => getWispType(value),
            },
            {
                Header: 'Data',
                accessor: 'wispData',
                // TODO: Format the data depending on the value of the whole row

            },
            {
                Header: 'RSSI',
                accessor: 'rssi',
            },
            // {
            //     // Header: 'Actions',
            //     accessor: 'actions',
            //     className: 'actions',
            // },
        ],
        []
    )

    let data = [];
    data = context.data;

    const tableInstance = useTable({ columns, data }, useSortBy);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
        <Window key={1} title="Recent Tags" right={<Icon small name="close" click={props.onClose} />}>
            {value => <h1>{value.toString()}</h1>}

            <div className='recent-tags-table-container'>
                <table {...getTableProps()}>
                    <thead>
                        {// Loop over the header rows
                            headerGroups.map(headerGroup => (
                                // Apply the header row props
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {// Loop over the headers in each row
                                        headerGroup.headers.map(column => (
                                            // Apply the header cell props
                                            <th {...column.getHeaderProps((column.getSortByToggleProps()))}>
                                                {// Render the header
                                                    column.render('Header')}
                                                <span className="sorted-indicator">
                                                    {column.isSorted
                                                        ? column.isSortedDesc
                                                            ? <Icon name="expand_less" />
                                                            : <Icon name="expand_more" />
                                                        : <Icon name=""/>}
                                                </span>
                                            </th>
                                        ))}
                                </tr>
                            ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {// Loop over the table rows
                            rows.map(row => {
                                // Prepare the row for display
                                prepareRow(row)
                                return (
                                    // Apply the row props
                                    <tr {...row.getRowProps()}>
                                        {// Loop over the rows cells
                                            row.cells.map(cell => {
                                                // Apply the cell props
                                                return (
                                                    <td
                                                        {...cell.getCellProps([
                                                            {
                                                                className: cell.column.className, // pay attention to this
                                                                // set here your other custom props
                                                            },
                                                        ])}
                                                    >
                                                        {cell.render('Cell')}
                                                    </td>
                                                )
                                            })}
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>
        </Window>
    );
}

export default RecentTags;