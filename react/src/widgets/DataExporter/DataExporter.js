import './DataExporter.scss';
import Window from 'components/window/Window/Window'
import { useContext, useState } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import { Connection } from 'dataManagement/ConnectionContext';
import { TextField, Chip, Autocomplete, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import { getVariableListFromRecentTags } from 'global/helperFunctions';
import ChipList from 'components/ChipList/ChipList';
import Icon from 'components/Icon/Icon';

const DataExporter = (props) => {
    return (
        <Window title="Data Exporter" right={<Icon small name="close" click={props.onClose} />}>
            <DataExporterInner />
        </Window>
    );
}
// ['seen', 'epc', 'rssi', 'wispType', 'wispData', 'wispId']
const defaultFields = [
    { label: 'Timestamp', value: 'seen' },
    { label: 'Reader Timestamp', value: 'seen_reader'},
    { label: 'RSSI', value: 'rssi' },
    { label: 'EPC', value: 'epc' },
    { label: 'Wisp Type', value: 'wispType' },
    { label: 'Wisp Data', value: 'wispData' },
    { label: 'Wisp ID', value: 'wispId' },
];

const DataExporterInner = (props) => {
    const tagData = useContext(TagData).data;
    const connectionStatus = useContext(Connection).connectionStatus;
    const tagDataRecent = useContext(TagDataRecent).data;

    const varList = getVariableListFromRecentTags(tagDataRecent);

    // Include the timestamp by default
    const [exportOptions, setExportOptions] = useState({
        vars: [defaultFields[0]],
    });

    if (connectionStatus.isInventorying) {
        return (
            <div className='stop-inventory'>
                <p>Stop the inventory to export data</p>
            </div>
        )
    }

    const handleExport = (e) => {
        const vars = exportOptions.vars;
        const header = vars.map(v => v.label);

        let data = [header];
        tagData.forEach(tag => {
            let row = [];
            vars.forEach(varKey => {
                if (tag[varKey.value]) {
                    row.push(tag[varKey.value]);
                } else if (tag.formatted && tag.formatted[varKey.value]) {
                    row.push(tag.formatted[varKey.value].value);
                } else {
                    row.push('');
                }
            })
            data.push(row);
        });

        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    console.log(varList)
    const allOptions = [
        { label: 'Computed variables', value: null, disabled: true },
        ...varList,
        { label: 'Tag properties', value: null, disabled: true },
        ...defaultFields,
    ]

    function hasValue(obj, key, value) {
        return obj.hasOwnProperty(key) && obj[key] === value;
    }

    return (
        <div>
            <Autocomplete
                sx={{ width: '100%' }}
                multiple
                id="tags-standard"
                options={allOptions}
                disableCloseOnSelect
                getOptionDisabled={(option) => option.disabled}
                isOptionEqualToValue={(option, array) => hasValue(array, 'value', option.value)}
                getOptionLabel={(option) => option.label}
                value={exportOptions.vars}
                onChange={(event, value) => {
                    setExportOptions({ ...exportOptions, vars: value });
                }}
                size='small'
                color='primary'
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        label="Columns (ordered)"
                        size='medium'
                    />
                )}
            />
            <div className='form-group right top-space'>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={exportOptions.vars.length < 1}
                    onClick={handleExport}
                >
                    Download CSV</Button>
            </div>
        </div>
    )
}

export default DataExporter;