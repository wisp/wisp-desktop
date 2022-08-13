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
    }
}


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


working_image = None


def cameraParser(epc):
    seq = int(epc[2:4], 16)
    adc = None
    pixels = None

    if (seq == 254):
        adc = int(epc[4:8], 16) * .0041544477  # Based on 4.25 V max ADC range
    else:
        pixel_string = epc[4:24]
        pixels = []

        while len(pixel_string) > 0:
            pixels.append(int(pixel_string[:2], 16))
            pixel_string = pixel_string[2:]

    global working_image
    if (working_image is None):
        working_image = WorkingImage()

    working_image.add_tag(seq, adc, pixels)

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
        'people_found': {
            'value': working_image.get_person_count(),
            'unit': 'people',
            'label': 'People Found'
        },
        'image': {
            'value': working_image.get_image(),
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

    if (parsed['people_found']['value'] is not None):
        string += 'People: {}, '.format(parsed['people_found']['value'])

    if (parsed['image']['value'] is not None):
        string += 'Image available, '

    return string.rstrip(', ')

def tempParser(epc):
    def scale(raw):
        value = int(raw, 16)
        if value < 0 or value > 1024:
            return ((value - 673) * 423) / 1024
        else:
            return "Invalid"

    temp = scale(epc[2:4])
    return {
        'temp': {
            'value': temp,
            'unit': 'C',
            'label': 'Temperature'
        }
    }

def tempParserString(parsed):
    return '{:.2f} C'.format(parsed['temp']['value'])