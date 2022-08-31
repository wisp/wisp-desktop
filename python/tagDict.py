import time
import math

from workingImage import WorkingImage

defs = {
    'XX': {
        'name': 'Acknowledgment',
        'parser': lambda epc: ackParser(epc),
        'parserString': lambda parsed: ackParserString(parsed)
    },
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda epc: accelParser(epc),
        'parserString': lambda parsed: accelParserString(parsed)
    },
    'CA': {
        'name': 'Camera',
        'parser': lambda epc: cameraParser(epc),
        'parserString': lambda parsed: cameraParserString(parsed)
    },
    '0F': {
        'name': 'Temperature',
        'parser': lambda epc: tempParser(epc),
        'parserString': lambda parsed: tempParserString(parsed)
    },
    # '03': {
    #     'name': 'Microphone',
    #     'parser': lambda epc: micParser(epc),
    #     'parserString': lambda parsed: micParserString(parsed)
    # }
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

def accelParser(epc):
    def scale(raw):
        value = int(raw, 16)
        value = 100.0 * value / 1024.0
        return value

    x = 1.13 * scale(epc[6:10]) - 52.77
    y = 1.15 * scale(epc[2:6]) - 56.67
    z = 1.10 * scale(epc[10:14]) - 56.17

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

working_images = {} # This keeps track of all the images that have been started
def cameraParser(epc):
    seq = int(epc[2:4], 16)
    adc = None
    pixels = None
    wisp_id = "CA00" # Right now, all camera tags have the same ID, but they don't have to.

    if (seq == 254):
        adc = int(epc[4:8], 16) * .0041544477  # Based on 4.25 V max ADC range
    else:
        pixel_string = epc[4:24]
        pixels = []

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
        # 'people_found': {
        #     'value': working_image.get_person_count(),
        #     'unit': 'people',
        #     'label': 'People Found'
        # },
        'state': {
            'value': working_images[wisp_id].get_state(),
            'unit': '',
            'label': 'State'
        },
        'image': {
            'value': working_images[wisp_id].get_image(),
            'unit': 'base64 string',
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


### Temperature Tag ###

def tempParser(epc):
    def scale(raw):
        value = int(raw, 16)
        # if value < 0 or value > 1024:
        #     return ((value - 673) * 423) / 1024
        # else:
        #     return 0
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


# ### Microphone Tag ###
# workingRecordings = {} # This keeps track of all the recordings that have been started
# def micParser(epc):
#     wispID = epc[8:12]
#     if wispID not in workingRecordings:
#         workingRecordings[wispID] = WorkingRecording()
#     workingRecordings[wispID].add_tag(epc)
