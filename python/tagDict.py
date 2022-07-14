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
    def scaleAndFlip(raw):
        value = int(raw, 16)

        if (value < 0 or value > 1024):
            value = 0

        value = 100.0 * value / 1024.0
        value = 100.0 - value
        return value


    return {
        'x': {
            'value': scaleAndFlip(d[4:8]) * 0.87,
            'unit': 'unitless',
            'label': 'X Acceleration'
        },
        'y': {
            'value': scaleAndFlip(d[0:4]) * 0.886,
            'unit': 'unitless',
            'label': 'Y Acceleration'
        },
        'z': {
            'value': -(scaleAndFlip(d[8:12]) - 100) * 1.034,
            'unit': 'unitless',
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