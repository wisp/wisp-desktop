from cProfile import label
import random
import time
import math

defs = {
    '0B': {
        'name': 'Acknowledgement',
        'parser': lambda d : ackParser(d),
        'parserString': lambda d : ackParserString(d),
    },
    '0C': {
        'name': 'Accelerometer',
        'parser': lambda d : accelParser(d),
        'parserString': lambda d : accelParserString(d),
    }
}

def ackParser(d):
    return {
        'sin': {
            'value': math.sin(time.time()),
            'unit': '',
            'label': 'sin'
        },
        'cos': {
            'value': math.cos(time.time()),
            'unit': '',
            'label': 'cos'
        }
    }

def ackParserString(d):
    parsed = ackParser(d)
    return parsed['sin']['value']

def accelParser(d):
    return {
        'x': {
            'value': d[0],
            'unit': 'g',
            'label': 'X'
        },
        'y': {
            'value': d[1],
            'unit': 'g',
            'label': 'Y'
        },
        'z': {
            'value': d[2],
            'unit': 'g',
            'label': 'Z'
        }
    }

def accelParserString(d):
    parsed = accelParser(d)
    return '{}, {}, {}'.format(parsed['x']['value'], parsed['y']['value'], parsed['z']['value'])