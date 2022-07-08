import Window from 'components/window/Window/Window'
import './RecentTags.scss'
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTable, useSortBy } from 'react-table';
import { TagDataRecent } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';
import { getRelativeTime, getWispType } from 'global/helperFunctions';
import { IconButton, Tooltip } from '@mui/material';
import { Connection } from 'dataManagement/ConnectionContext';

// TODO: Refresh the table body such that table sorting remains when a new tag is added.
//       Add buttons for filtering each tag (add, remove from whitelist, blacklist).

const RecentTags = (props) => {
    // const connectionStatus = useContext(Connection)
    const context = useContext(TagDataRecent);
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    const [filters, setFilters] = useContext(Connection).filter;

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
                width: 150,
            },
            {
                Header: 'Count',
                accessor: 'count',
                width: 65,
            },
            {
                Header: 'EPC',
                accessor: 'epc',
                width: 250,
            },
            {
                Header: 'Tag Type',
                accessor: 'wispType',
                Cell: ({ cell: { value } }) => getWispType(value),
                width: 150,
            },
            {
                Header: 'Data',
                accessor: 'formattedString',
                width: 240,
            },
            {
                Header: 'RSSI',
                accessor: 'rssi',
                width: 30,
            },
            {
                Header: 'Filters',
                accessor: 'actions',
                className: 'actions',
                width: 75,
                minWidth: 50,
                textAlign: 'right',
                disableSortBy: true,
                Cell: ({ cell }) => {
                    const wispId = cell.row.values.epc.slice(cell.row.values.epc.length - 4);
                    return (
                        <div>
                            {filters.whitelist.includes(wispId) || filters.blacklist.includes(wispId) ?
                                <span>
                                    <Tooltip title="Remove filter">
                                        <IconButton
                                            size="small"
                                            sx={{ m: -0.5 }}
                                            onClick={() => {
                                                setFilters({
                                                    ...filters,
                                                    blacklist: filters.blacklist.filter(e => e !== wispId),
                                                    whitelist: filters.whitelist.filter(e => e !== wispId)
                                                })
                                            }}>
                                            <Icon name="filter_alt_off" small />
                                        </IconButton>
                                    </Tooltip>
                                </span>

                                :

                                <span className='action-icons'>
                                    <Tooltip title="Add to whitelist">
                                        <IconButton
                                            size="small"
                                            sx={{ m: -0.5, mr: 0.1 }}
                                            onClick={() => {
                                                setFilters({
                                                    ...filters,
                                                    whitelist: [...filters.whitelist, wispId]
                                                })
                                            }}>
                                            <Icon name="check_circle" small />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Add to blacklist">
                                        <IconButton
                                            size="small"
                                            sx={{ m: -0.5 }}
                                            onClick={() => {
                                                setFilters({
                                                    ...filters,
                                                    blacklist: [...filters.blacklist, wispId]
                                                })
                                            }}>
                                            <Icon name="block" small />
                                        </IconButton>
                                    </Tooltip>

                                </span>

                            }
                        </div>
                    )
                }
            },
        ],
        [filters]
    )

    const data = [];
    for (const wispId of Object.keys(context.data)) {
        data.push(context.data[wispId]);
    }

    const tableInstance = useTable({
        columns,
        data,

        autoResetPage: false,
        autoResetExpanded: false,
        autoResetGroupBy: false,
        autoResetSelectedRows: false,
        autoResetSortBy: false,
        autoResetFilters: false,
        autoResetRowState: false,
    }, useSortBy);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
        <Window title="Recent Tags" right={<Icon small name="close" click={props.onClose} />}>
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
                                            <th {...column.getHeaderProps([
                                                {
                                                    style: { textAlign: column.textAlign }
                                                },
                                                column.getSortByToggleProps()
                                            ])}>
                                                {// Render the header
                                                    column.render('Header')}
                                                <span className="sorted-indicator">

                                                    {column.isSorted
                                                        ? column.isSortedDesc
                                                            ? <Icon name="expand_less" />
                                                            : <Icon name="expand_more" />
                                                        : !column.disableSortBy ?
                                                            <span className='hover-sort-indicator'>
                                                                <Icon name="expand_more" />
                                                            </span>
                                                            :
                                                            null
                                                    }
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
                                                                width: cell.column.width,
                                                                // minWidth: cell.column.minWidth,
                                                                style: { textAlign: cell.column.textAlign, minWidth: cell.column.minWidth }
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

export default React.memo(RecentTags);