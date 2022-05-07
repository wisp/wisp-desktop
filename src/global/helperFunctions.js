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
        string = new Date(time).toLocaleString();
    }

    if (starting == "") {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return starting + string;
}

export function getWispType(type) {
    const tagTypes = {
        '0B': 'Acknowledgement',
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