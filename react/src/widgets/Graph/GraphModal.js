import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';

const GraphModal = (props) => {
    const [graphOptions, setGraphOptions] = props.graphOptions;

    const allVars = [...props.varList, ...props.defaultFields]

    const getSourceString = (source) => {
        const variable = allVars.find(item => item.value === source)
        return variable.label + "(" + variable.unit + ")";
    }


    return (
        <div>
            <div className="form-group">
                <FormControl fullWidth variant='filled' sx={{ width: '60%' }}>
                    <InputLabel id="select-label">Data source</InputLabel>
                    <Select
                        labelId="select-label"
                        value={graphOptions.ySource}
                        onChange={(e) => { 
                            console.log("Y src: " + e.target.value)
                            setGraphOptions({ ...graphOptions, ySource: e.target.value, ySourceStr: getSourceString(e.target.value) })
                        }}
                    >
                        <MenuItem value={null} disabled={true}>Computed variables</MenuItem>
                        {props.varList &&
                            props.varList.map((variable) => {
                                if (variable.unit) {
                                    return <MenuItem value={variable.value}>{variable.label} ({variable.unit})</MenuItem>
                                } else {
                                    return <MenuItem value={variable.value}>{variable.label}</MenuItem>
                                }
                            })
                        }
                        <MenuItem value={null} disabled={true}>Tag properties</MenuItem>
                        {props.defaultFields &&
                            props.defaultFields.map((variable) => {
                                if (variable.unit) { // Only show numeric properties
                                    return <MenuItem value={variable.value}>{variable.label} ({variable.unit})</MenuItem>
                                }
                            })
                        }
                    </Select>
                </FormControl>
                <TextField
                    label="Min"
                    variant="filled"
                    value={graphOptions.minY}
                    onChange={(e) => setGraphOptions({ ...graphOptions, minY: e.target.value })}
                    sx={{ width: '20%' }}
                />
                <TextField
                    label="Max"
                    variant="filled"
                    value={graphOptions.maxY}
                    onChange={(e) => setGraphOptions({ ...graphOptions, maxY: e.target.value })}
                    sx={{ width: '20%' }}
                />
                <TextField
                    label="Tag limit"
                    variant="filled"
                    value={graphOptions.tagNum}
                    onChange={(e) => setGraphOptions({ ...graphOptions, tagNum: e.target.value })}
                    sx={{ width: '30%' }}
                />
            </div>
        </div>
    )
}

export default GraphModal;