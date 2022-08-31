import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';
import ChipList from 'components/ChipList/ChipList';

const GraphModal = (props) => {
    const [graphOptions, setGraphOptions] = props.graphOptions;

    const getSourceString = (source) => {
        const variable = props.varList.find(item => item.value === source)
        return variable.label + "(" + variable.unit + ")";
    }


    return (
        <div>
            <h2>Chart</h2>
            <div className="form-group">
                <FormControl fullWidth variant='filled' sx={{ width: '65%' }}>
                    <InputLabel id="select-label">Chart style</InputLabel>
                    <Select
                        id="demo-simple-select"
                        labelId="select-label"
                        value={graphOptions.chartStyle}
                        label="Chart Style"
                        onChange={(e) => { setGraphOptions({ ...graphOptions, chartStyle: e.target.value }) }}
                    >
                        <MenuItem value={'line'}>Line</MenuItem>
                        <MenuItem value={'scatter'}>Scatter</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Max tags to plot"
                    variant="filled"
                    value={graphOptions.tagNum}
                    onChange={(e) => setGraphOptions({ ...graphOptions, tagNum: e.target.value })}
                    sx={{ width: '35%' }}
                />
            </div>

            <div className="spacer-3" />
            <h2>X–Axis</h2>
            <div className="spacer-n2" />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={graphOptions.timeAsX}
                        onChange={(e) => setGraphOptions({ ...graphOptions, timeAsX: e.target.checked })}
                    />
                }
                label="Use time as the x–axis"
            />
            <div className="spacer-1" />
            <div className="form-group">
                <FormControl fullWidth variant='filled' sx={{ width: '65%' }} disabled={graphOptions.timeAsX}>
                    <InputLabel id="select-label">Data source</InputLabel>
                    <Select
                        id="demo-simple-select"
                        labelId="select-label"
                        value={graphOptions.xSource}
                        onChange={(e) => { setGraphOptions({ ...graphOptions, xSource: e.target.value, xSourceStr: getSourceString(e.target.value) }) } }
                    >
                        {/* <MenuItem value={'sin'}>Sine</MenuItem>
                        <MenuItem value={'cos'}>Cosine</MenuItem> */}
                        {props.varList &&
                            props.varList.map((variable) => {
                                return <MenuItem value={variable.value}>{variable.label} ({variable.unit})</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
                <TextField
                    label="Min"
                    variant="filled"
                    disabled={graphOptions.timeAsX}
                    value={graphOptions.minX}
                    onChange={(e) => setGraphOptions({ ...graphOptions, minX: e.target.value })}
                    sx={{ width: '20%' }}
                />
                <TextField
                    label="Max"
                    variant="filled"
                    disabled={graphOptions.timeAsX}
                    value={graphOptions.maxX}
                    onChange={(e) => setGraphOptions({ ...graphOptions, maxX: e.target.value })}
                    sx={{ width: '20%' }}
                />
            </div>

            <div className="spacer-3" />
            <h2>Y–Axis</h2>
            <div className="form-group">
                <FormControl fullWidth variant='filled' sx={{ width: '65%' }}>
                    <InputLabel id="select-label">Data source</InputLabel>
                    <Select
                        id="demo-simple-select"
                        labelId="select-label"
                        value={graphOptions.ySource}
                        onChange={(e) => { setGraphOptions({ ...graphOptions, ySource: e.target.value, ySourceStr: getSourceString(e.target.value)}) }}
                    >
                        {props.varList &&
                            props.varList.map((variable) => {
                                return <MenuItem value={variable.value}>{variable.label} ({variable.unit})</MenuItem>
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
            </div>
            <div className="spacer-1" />
            {/* <FormControlLabel
                control={
                    <Checkbox
                        checked={graphOptions.plotIdsSeparate}
                        onChange={(e) => setGraphOptions({ ...graphOptions, plotIdsSeparate: e.target.checked })}
                    />
                }
                label="Plot each WISP ID separately"
            /> */}
            {/* <div className="spacer-2" /> */}
            {/* <div className="form-group right">
                <Button
                    color="primary"
                    onClick={() => props.close()}
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => props.close()}
                >
                    Save
                </Button>
            </div> */}
        </div >
    )
}

export default GraphModal;