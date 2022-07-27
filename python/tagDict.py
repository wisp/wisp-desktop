import time
import math
from workingImage import WorkingImage

defs = {
    '0C': {
        'name': 'Acknowledgment',
        'parser': lambda epc: ackParser(epc),
        'parserString': lambda epc: ackParserString(epc)
    },
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda epc: accelParser(epc),
        'parserString': lambda epc: accelParserString(epc)
    },
    'CA': {
        'name': 'Camera',
        'parser': lambda epc: cameraParser(epc),
        'parserString': lambda epc: cameraParserString(epc)
    }
}


def ackParser(epc):
    return {
        'sin': {
            'value': math.sin(time.time()),
            'unit': 'for testing only',
            'label': 'sin'
        },
        'cos': {
            'value': math.cos(time.time()),
            'unit': 'for testing only',
            'label': 'cos'
        }
    }


def ackParserString(epc):
    parsed = ackParser(epc)
    return parsed['sin']['value']


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


def accelParserString(epc):
    parsed = accelParser(epc)
    return '{:10.4f}, {:10.4f}, {:10.4f}'.format(parsed['x']['value'], parsed['y']['value'], parsed['z']['value'])


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
        'image': {
            'value': working_image.get_image(),
            'unit': 'base64 string',
            'label': 'Image'
        }
    }


def cameraParserString(d):
    parsed = cameraParser(d)
    # Format ADC: ##.## V, Seq: ###
    string = ""

    if (parsed['seq_count']['value'] is not None):
        string += 'Seq: {}, '.format(parsed['seq_count']['value'])

    if (parsed['adc']['value'] is not None):
        string += 'ADC: {:10.4f} V, '.format(parsed['adc']['value'])

    if (parsed['image']['value'] is not None):
        string += 'Image available, '

    return string.rstrip(', ')
