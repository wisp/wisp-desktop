from tag_helpers.image.workingImage import WorkingImage
from tag_helpers.audio.workingRecording import WorkingRecording

defs = {
    'XX': {
        'name': 'Acknowledgment',
        'parser': lambda epc: ackParser(epc),
        'parserString': lambda parsed: ackParserString(parsed)
    },
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda epc: accelParser(epc, type="0B"),
        'parserString': lambda parsed: accelParserString(parsed)
    },
    '0C': {
        'name': 'Accelerometer',
        'parser': lambda epc: accelParser(epc, type="0C"),
        'parserString': lambda parsed: accelParserString(parsed)
    },
    'CA': {
        'name': 'Camera',
        'parser': lambda epc: cameraParser(epc),
        'parserString': lambda parsed: cameraParserString(parsed)
    },
    'AD': {
        'name': 'Audio',
        'parser': lambda epc: audioParser(epc),
        'parserString': lambda parsed: audioParserString(parsed)
    },
    '0F': {
        'name': 'Temperature',
        'parser': lambda epc: tempParser(epc),
        'parserString': lambda parsed: tempParserString(parsed)
    },
}


### Acknowledgement Tag ###

def ackParser(epc):
    return {
        'ack': {
            'value': 1,
            'unit': 'N/A',
            'label': 'ACK'
        }
    }


def ackParserString(epc):
    return "N/A"


### Accelerometer Tag ###

def accelParser(epc, type="0B"):
    def scale(raw):
        value = int(raw, 16)
        if type == "0C":
            # Convert to value between -50 and 50
            value = ((100.0 * value / 256.0) - 50)
            return 0.392 * value
        else:
            # Convert to value between -50 and 50
            value = ((100.0 * value / 1024.0) - 50)
            return 1.13 * value

    x = scale(epc[6:10])
    z = scale(epc[10:14])

    y = scale(epc[2:6])
    if type == "0C":
        y = -y

    return {
        'x': {
            'value': x,
            'unit': 'm/s^2',
            'label': 'X Acceleration'
        },
        'y': {
            'value': y,
            'unit': 'm/s^2',
            'label': 'Y Acceleration'
        },
        'z': {
            'value': z,
            'unit': 'm/s^2',
            'label': 'Z Acceleration'
        }
    }


def accelParserString(parsed):
    return '{:.2f}, {:.2f}, {:.2f}'.format(parsed['x']['value'], parsed['y']['value'], parsed['z']['value'])


### Camera Tag ###

working_images = {}  # This keeps track of all the images that have been started


def cameraParser(epc):
    seq = int(epc[2:4], 16)
    adc = None
    pixels = None
    # Right now, all camera tags have the same ID, but they don't have to.
    wisp_id = "CA00"

    if (seq == 254):
        adc = int(epc[4:8], 16) * .0041544477  # Based on 4.25 V max ADC range
    else:
        pixel_string = epc[4:24]
        pixels = []

        # Each pixel is 1 byte
        while len(pixel_string) > 0:
            pixels.append(int(pixel_string[:2], 16))
            pixel_string = pixel_string[2:]

    global working_images
    if (wisp_id not in working_images):
        working_images[wisp_id] = WorkingImage()

    working_images[wisp_id].add_tag(seq, adc, pixels)

    return {
        'seq_count': {
            'value': seq,
            'unit': 'unitless',
            'label': 'Sequence Count'
        },
        'adc': {
            'value': adc,
            'unit': 'V',
            'label': 'ADC'
        },
        'pixels': {
            'value': pixels,
            'unit': 'grayscale (256)',
            'label': 'Pixels'
        },
        'state': {
            'value': working_images[wisp_id].get_state(),
            'unit': '',
            'label': 'State'
        },
        'image': {
            'value': working_images[wisp_id].get_image(),
            'unit': 'base64 png',
            'label': 'Image'
        }
    }


def cameraParserString(parsed):
    # Format ADC: ##.## V, Seq: ###
    string = ""

    if (parsed['seq_count']['value'] is not None):
        string += 'Seq: {}, '.format(parsed['seq_count']['value'])

    if (parsed['adc']['value'] is not None):
        string += 'ADC: {:10.4f} V, '.format(parsed['adc']['value'])

    # if (parsed['people_found']['value'] is not None):
    #     string += 'People: {}, '.format(parsed['people_found']['value'])

    if (parsed['state']['value'] == 'complete'):
        string += 'Image available, '
    elif (parsed['state']['value'] == 'incoming'):
        string += 'Incoming image, '

    return string.rstrip(', ')


### Audio Tag ###

working_recordings = {}  # This keeps track of all the recordings that have been started


def audioParser(epc):
    seq = int(epc[2:4], 16)
    adc = None
    samples = None
    # Right now, all audio tags have the same ID, but they don't have to.
    wisp_id = "AD00"

    if (seq == 254):
        adc = int(epc[4:8], 16) * .0041544477  # Based on 4.25 V max ADC range
    else:
        sample_string = epc[4:24]
        samples = []

        # Each sample is 4 bits
        while len(sample_string) > 0:
            samples.append(int(sample_string[:1], 16))
            sample_string = sample_string[1:]

    global working_recordings
    if (wisp_id not in working_recordings):
        working_recordings[wisp_id] = WorkingRecording()

    working_recordings[wisp_id].add_tag(seq, adc, samples)

    return {
        'seq_count': {
            'value': seq,
            'unit': 'unitless',
            'label': 'Sequence Count'
        },
        'adc': {
            'value': adc,
            'unit': 'V',
            'label': 'ADC'
        },
        'samples': {
            'value': samples,
            'unit': 'ADPCM (4b)',
            'label': 'Samples'
        },
        'state': {
            'value': working_recordings[wisp_id].get_state(),
            'unit': '',
            'label': 'State'
        },
        'recording': {
            'value': working_recordings[wisp_id].get_recording(),
            'unit': 'base64 wav',
            'label': 'Recording'
        }
    }


def audioParserString(parsed):
    string = ""

    if (parsed['seq_count']['value'] is not None):
        string += 'Seq: {}, '.format(parsed['seq_count']['value'])
    if (parsed['adc']['value'] is not None):
        string += 'ADC: {:10.4f} V, '.format(parsed['adc']['value'])
    if (parsed['state']['value'] == 'complete'):
        string += 'Recording available, '
    elif (parsed['state']['value'] == 'incoming'):
        string += 'Incoming recording, '

    return string.rstrip(', ')


### Temperature Tag ###

def tempParser(epc):
    def scale(raw):
        value = int(raw, 16)
        return ((value - 673) * 423) / 1024

    temp = scale(epc[3:6])
    return {
        'temp': {
            'value': temp,
            'unit': 'C',
            'label': 'Temperature'
        }
    }


def tempParserString(parsed):
    return '{:.2f} C'.format(parsed['temp']['value'])


### Temperature Humidity Tag ###

def tempHumidityParser(epc):
    tLsb = int(epc[2:4], 16)
    tMsb = int(epc[4:6], 16)
    hLsb = int(epc[6:8], 16)
    hMsb = int(epc[8:10], 16)
    tRaw = (tMsb << 8) | tLsb
    hRaw = (hMsb << 8) | hLsb
    temp = (tRaw / 2**16) * 165 - 40
    humidity = (hRaw / 2**16) * 100

    return {
        'temp': {
            'value': temp,
            'unit': 'C',
            'label': 'Temperature'
        },
        'humidity': {
            'value': humidity,
            'unit': '%',
            'label': 'Humidity'
        }
    }

def tempHumidityParserString(parsed):
    return '{:.2f} C, {:.2f} %'.format(parsed['temp']['value'], parsed['humidity']['value'])