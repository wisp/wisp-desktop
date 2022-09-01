import Window from 'components/window/Window/Window'
import { useContext, useState, useEffect, useRef } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import { Connection } from 'dataManagement/ConnectionContext';
import { CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Icon from 'components/Icon/Icon';
import { getVariableListFromRecentTags } from 'global/helperFunctions';


import './Gauge.scss'

const Gauge = (props) => {
    // TagDataRecent contains a dictionary of tags read by
    // the reader, with the keys being each tag's WISP ID.
    return (
        <Window title="Gauge" right={<Icon small name="close" click={props.onClose} />}>
            <GaugeInner />
        </Window>
    );
}

const RANGES = {
    x: [-20, 20],
    y: [-20, 20],
    z: [-20, 20],
    seq_count: [0, 255],
    adc: [0, 4.5],
    people_found: [0, 10],
    temp: [10, 50],
}

const GaugeInner = (props) => {

    const tagDataRecent = useContext(TagDataRecent).data;
    const varList = getVariableListFromRecentTags(tagDataRecent);
    const gaugeRef = useRef(null);

    const [dataSource, setDataSource] = useState(null);
    const [range, setRange] = useState([0, 100]);
    const [value, setValue] = useState(0);
    const [size, setSize] = useState(130);

    useEffect(() => {
        if (dataSource && RANGES[dataSource]) {
            setRange(RANGES[dataSource]);
        }
    }, [dataSource]);


    useEffect(() => {
        let workingVal = 0;
        if (dataSource) {
            const keys = Object.keys(tagDataRecent);
            for (const key of keys) {
                const thisTag = tagDataRecent[key];
                if (thisTag.formatted && thisTag.formatted[dataSource] && thisTag.formatted[dataSource].value) {
                    workingVal = thisTag.formatted[dataSource].value
                }
            }
        }
        setValue(workingVal);
    }, [dataSource, tagDataRecent]);


    useEffect(() => {
        const myObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                setSize(entry.contentRect.height);
            });
        });
        myObserver.observe(gaugeRef.current);
        return () => myObserver.disconnect();
    }, [props.options]);

    return (
        <div className="gauge-contain">
            <div className='gauge' ref={gaugeRef}>
                <CircularProgress
                    size={size}
                    thickness={6}
                    value={72.2}
                    variant="determinate"
                    color='secondary'
                    sx={{
                        color: '#ddd',
                        marginBottom: '-10px',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        svg: {
                            transform: 'rotate(-130deg)',
                        }
                    }}
                />
                <CircularProgress
                    size={size}
                    thickness={6}
                    value={Math.min(Math.max(((value - range[0]) / (range[1] - range[0])), 0), 1) * 72.2}
                    variant="determinate"
                    sx={{
                        marginBottom: '-10px',
                        svg: {
                            transform: 'rotate(-130deg)',
                        }
                    }}
                />
                <div className='gauge-value'>{Math.round(value * 10) / 10}</div>
            </div>
            <div style={{ width: '100%', margin: 'auto' }}>
                <FormControl fullWidth variant='filled'>
                    <InputLabel fullWidth id="select-label">Data source</InputLabel>
                    <Select
                        fullWidth

                        labelId="select-label"
                        value={dataSource}
                        onChange={(e) => { setDataSource(e.target.value) }}
                    >
                        {varList &&
                            varList.map((variable) => {
                                return <MenuItem value={variable.value}>{variable.label} ({variable.unit})</MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
            </div>
        </div>
    )

}

export default Gauge;