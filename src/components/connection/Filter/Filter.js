import './Filter.scss';
import Icon from 'components/Icon/Icon';
import { useState, useContext } from 'react';
import { FormGroup, Tooltip } from '@mui/material';
import { Connection } from 'dataManagement/ConnectionContext';
import ChipList from 'components/ChipList/ChipList';

const Filter = (props) => {
    const [connection, setConnection] = useContext(Connection);

    function setFilter(filter) {
        setConnection({
            ...connection,
            filters: {
                ...connection.filters,
                ...filter
            }
        });
    }


    return (
        <div className="filter">
            <h2>Tag Filtering</h2>
            <h3>Tags are filtered by their WISP IDs&nbsp;&nbsp;
                <Tooltip title="The last 4 characters of a tag's EPC is its WISP ID" placement="right">
                    <span><Icon name="info" small /></span>
                </Tooltip>
            </h3>
            <div className='spacer-2'></div>
            <FormGroup>
                <ChipList
                    variant="filled"
                    color="success"
                    label="Whitelist"
                    // helperText="Invalid WISP ID"
                    // error
                    sx={{ mb: 1 }}
                    // placeholder="WISP ID"
                    value={connection.filters.whitelist}
                    onChange={(value) => setFilter({ whitelist: value })}
                />
                <ChipList
                    variant="filled"
                    color="error"
                    label="Blacklist"
                    helperText=""
                    // placeholder="WISP ID"
                    value={connection.filters.blacklist}
                    onChange={(value) => setFilter({ blacklist: value })}
                />
            </FormGroup>
        </div>
    );
}

export default Filter;