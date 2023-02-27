import './TagRate.scss';
import Window from 'components/window/Window/Window';
import React, { useEffect, useState, useContext, useRef, memo } from 'react';
import { TagData, TagDataRecent } from 'dataManagement/EelListener';
import Icon from 'components/Icon/Icon';

import _ from "lodash";
import { TextField, Button, IconButton, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from '@mui/material';


const TagRate = (props) => {
    return (
        <Window title="Tag Rate" right={<Icon small name="close" click={props.onClose} />}>
            <RateInner randKey={props.randKey} />
        </Window >
    );
}

const RateInner = (props) => {
    const data = useContext(TagData).data;
    console.log(data);

    const [rateOptions, setRateOptions] = useState({
        mode: "normal",
        interval: 10,
    });

    function getTagRate(interval = 5, inverse = false) {
        if (!inverse) {
            // get the time from 5 seconds ago
            const time = new Date().getTime() / 1000 - interval;
            // get the tags that were added in the last 15 seconds
            const tags = data.filter(tag => tag.seenUI > time);
            // get the number of tags that were added in the last 15 seconds
            const tagRate = tags.length;
            // return the tag rate
            return tagRate / interval;
        } else {
            // get the last few tags
            const tags = data.slice(-interval);
            // get the average times between tags
            const delays = [];
            for (let i = 0; i < tags.length - 1; i++) {
                delays.push(tags[i + 1].seenUI - tags[i].seenUI);
            }
            // get the average time between tags
            const averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
            // return the tag rate
            return 1 / averageDelay;
        }
    }

    return (
        <div>
            <FormControl fullWidth variant='filled' sx={{ width: '60%' }}>
                <InputLabel id="select-label">Averaging mode</InputLabel>
                <Select
                    sx={{ mb: 2, mr: 1, w: "60%" }}
                    variant="filled"
                    value={rateOptions.mode}
                    onChange={(e) => setRateOptions({ ...rateOptions, mode: e.target.value })}
                >
                    <MenuItem value="normal">Tags from interval</MenuItem>
                    <MenuItem value="inverse">Average time between tags</MenuItem>
                </Select>
            </FormControl>
            <TextField
                variant='filled'
                sx={{ mb: 4, width: "38%" }}
                label={"Interval " + (rateOptions.mode === "inverse" ? "(tags)" : "(s)")}
                value={rateOptions.interval}
                onChange={(e) => setRateOptions({ ...rateOptions, interval: e.target.value })}
            />
            <div className="rate-indicator">
                {getTagRate(rateOptions.interval, (rateOptions.mode == "inverse")).toFixed(2)}
            </div>
        </div>
    )
}

export default TagRate;