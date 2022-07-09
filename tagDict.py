from cProfile import label
import random
import time
import math

defs = {
    '0C': {
        'name': 'Acknowledgement',
        'parser': lambda d : ackParser(d),
        'parserString': lambda d : ackParserString(d),
    },
    '0B': {
        'name': 'Accelerometer',
        'parser': lambda d : accelParser(d),
        'parserString': lambda d : accelParserString(d),
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
            'value': (scaleAndFlip(d[4:8]) * 0.87)*2,
            'unit': 'unitless',
            'label': 'X Acceleration'
        },
        'y': {
            'value': (scaleAndFlip(d[0:4]) * 0.886)*2,
            'unit': 'unitless',
            'label': 'Y Acceleration'
        },
        'z': {
            'value': (-(scaleAndFlip(d[8:12]) - 100) * 1.034)*2,
            'unit': 'unitless',
            'label': 'Z Acceleration'
        }
    }

    

def accelParserString(d):
    parsed = accelParser(d)
    return '{:10.4f}, {:10.4f}, {:10.4f}'.format(parsed['x']['value'], parsed['y']['value'], parsed['z']['value'])