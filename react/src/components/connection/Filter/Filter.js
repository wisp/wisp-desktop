import './Filter.scss';
import Icon from 'components/Icon/Icon';
import { useState, useContext, useEffect } from 'react';
import { FormGroup, Tooltip } from '@mui/material';
import { Connection } from 'dataManagement/ConnectionContext';
import ChipList from 'components/ChipList/ChipList';
import * as yup from 'yup';
import { useAlert } from 'react-alert';

const validation = yup.object({
    whitelist: yup.array().of(yup.string().uppercase().length(4, 'WISP ID must be 4 characters long').matches('^[A-Fa-f0-9Xx]{4}$', 'Invalid WISP ID')),
    blacklist: yup.array().of(yup.string().uppercase().length(4, 'WISP ID must be 4 characters long').matches('^[A-Fa-f0-9Xx]{4}$', 'Invalid WISP ID')),
});

const Filter = (props) => {
    const alert = useAlert();
    const [filters, setFilters] = useContext(Connection).filter;

    const updateFilter = (newFilter) => {
        validation.validate(newFilter).then(() => {
            setFilters({ ...filters, ...newFilter });
        }).catch(err => {
            alert.show(err.message, { title: "", timeout: 3000, type: 'error', icon: 'close' });
        });
    }

    // useEffect(() => {
    //     changeFilters(filters.whitelist, filters.blacklist);
    // }, [filters]);


    return (
        <div className="filter">
            <h2>Filtering</h2>
            <h3>Tags are filtered by their WISP IDs&nbsp;&nbsp;
                <Tooltip title="The last 4 characters of a tag's EPC is its WISP ID. 'X' can be used as a wildcard 4-bit character." placement="right">
                    <span><Icon name="info" small /></span>
                </Tooltip>
            </h3>
            <div className='spacer-2'></div>
            <FormGroup>
                <ChipList
                    variant="filled"
                    color="success"
                    label="Whitelist"
                    sx={{ mb: 1 }}
                    placeholder="WISP ID"
                    value={filters.whitelist}
                    onChange={(arr) => updateFilter({ whitelist: arr })}
                />
                <ChipList
                    variant="filled"
                    color="error"
                    label="Blacklist"
                    sx={{ mb: 1 }}
                    placeholder="WISP ID"
                    value={filters.blacklist}
                    onChange={(arr) => updateFilter({ blacklist: arr })}
                />
            </FormGroup>
        </div>
    );
}

export default Filter;