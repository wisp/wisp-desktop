export const hostNameRegex = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;

export function getRelativeTime(time, starting = "", ending = 'ago') {

    if (time == -1) {
        return "Never";
    }

    time = time * 1000
    var delta = Math.round((+new Date - time) / 1000);

    var minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

    var string;

    if (delta < 5) {
        string = 'just now';
    } else if (delta < minute) {
        string = delta + ' seconds ' + ending;
    } else if (delta < 2 * minute) {
        string = 'a minute ' + ending;
    } else if (delta < hour) {
        string = Math.floor(delta / minute) + ' minutes ' + ending;
    } else if (Math.floor(delta / hour) == 1) {
        string = 'an hour ' + ending;
    } else if (delta < day) {
        string = Math.floor(delta / hour) + ' hours ' + ending;
    } else {
        string = new Date(time).toLocaleTimeString([], { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit' })
    }

    if (starting == "") {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return starting + string;
}

export function getWispType(type) {
    const tagTypes = {
        '0B': 'Accelerometer',
    }
    if (type in tagTypes) {
        return tagTypes[type];
    }
    return type;
}

export function getFormattedData(type, data) {
    // const formatters = {
    //     '0B': AckFormatter,
    // }

    // function AckFormatter() {
    //     return 'N/A'
    // }

    // if (type in formatters) {
    //     return formatters[type](data);
    // }
    console.log(data)
    return "HERE";
}

export function getRecentDataFromArray(array) {
    // Remove duplicate entries based on wispId and add count for each duplicate
    const recentDataMap = {};
    for (let i = 0; i < array.length; i++) {
        const tag = array[i];
        if (tag['wispId'] in recentDataMap) {
            recentDataMap[tag['wispId']].count++;
        } else {
            recentDataMap[tag['wispId']] = { ...tag, count: 1 };
        }
    }
    return recentDataMap;
}

export function getVariableListFromRecentTags(recentTags) {
    const variableList = [];
    if (recentTags) {
        // for (let i = 0; i < recentTags.length; i++) {
        //     const tag = recentTags[i];
        //     if (tag.formatted) {
        //         // get list of keys
        //         console.log(tag)
        //         const keys = Object.keys(tag.formatted);
        //         console.log(keys)
        //         for (let j = 0; j < keys.length; j++) {
        //             const key = keys[j];
        //             if (!(key in variableList)) {
        //                 variableList.push(key);
                        
        //             }
        //         }
        //     }
        // }
        const keys = Object.keys(recentTags);
        for (const key of keys) {
            const tag = recentTags[key];
            if (tag.formatted) {
                const varKeys = Object.keys(tag.formatted);
                for (let j = 0; j < varKeys.length; j++) {
                    const varKey = varKeys[j];
                    if (!(varKey in variableList)) {
                        variableList.push({var: varKey, unit: tag.formatted[varKey].unit, label: tag.formatted[varKey].label});
                    }
                }
            }
        }
    }
    return variableList;
}