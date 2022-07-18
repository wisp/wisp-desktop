import time
import math

defs = {
    '0C': {
        'name': 'Acknowledgment',
        'parser': lambda d : ackParser(d),
        'parserString': lambda d : ackParserString(d)
    },
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda d : accelParser(d),
        'parserString': lambda d : accelParserString(d)
    },
    'CA': {
        'name': 'Camera',
        'parser': lambda d : cameraParser(d),
        'parserString': lambda d : cameraParserString(d)
    }
}

def ackParser(d):
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

def ackParserString(d):
    parsed = ackParser(d)
    return parsed['sin']['value']

def accelParser(d):
    def scale(raw):
        value = int(raw, 16)
        value = 100.0 * value / 1024.0
        return value

    x = 1.13 * scale(d[4:8])  - 52.77
    y = 1.15 * scale(d[0:4])  - 56.67
    z = 1.10 * scale(d[8:12]) - 56.17


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

    

def accelParserString(d):
    parsed = accelParser(d)
    return '{:10.4f}, {:10.4f}, {:10.4f}'.format(parsed['x']['value'], parsed['y']['value'], parsed['z']['value'])


def cameraParser(d):
    return {
        'seq_count': {
            'value': int(d[0:2], 16),
            'unit': 'unitless',
            'label': 'Sequence Count'
        },
        'adc': {
            'value': int(d[2:6], 16) * .0041544477, # Based on 4.25 V max ADC range
            'unit': 'V',
            'label': 'ADC'
        },
        # 'pixels': {
        #     for 
        # }
    }

def cameraParserString(d):
    parsed = cameraParser(d)
    # Format ADC: ##.## V, Seq: ###
    return 'ADC: {:10.2f} V, Seq: {}'.format(parsed['adc']['value'], parsed['seq_count']['value'])