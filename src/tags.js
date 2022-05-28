const tags = {
    '0B': {
        name: 'Acknowledgement',
        parser: {},
        parserString: 'N/A',
    },
    '0C': {
        name: 'Accelerometer',
        parser: accelerometerParser,
        parserString: accelerometerParserString,
    },
}

const accelerometerParser = (dataString) => {
    const values = parseHexString(dataString);
    return {
        x: {
            value: values[0],
            unit: 'g',
            label: 'X Acceleration',
        },
        y: {
            value: values[1],
            unit: 'g',
            label: 'Y Acceleration',
        },
        z: {
            value: values[2],
            unit: 'g',
            label: 'Z Acceleration',
        }
    }
}

const accelerometerParserString = (dataString) => {
    const parsed = accelerometerParser(dataString);
    return `${parsed.x.value}, ${parsed.y.value}, ${parsed.z.value}`
}

const parseHexString = (str) => { 
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}