# from base64 import b64encode
# from io import BytesIO
import numpy as np
from PIL import Image
from io import BytesIO
from base64 import b64encode
class ADPCM:
    def __init__(self):
        self.stepSize = [
            7,    8,    9,   10,   11,   12,   13,   14,
            16,   17,   19,   21,   23,   25,   28,   31,
            34,   37,   41,   45,   50,   55,   60,   66,
            73,   80,   88,   97,  107,  118,  130,  143,
            157,  173,  190,  209,  230,  253,  279,  307,
            337,  371,  408,  449,  494,  544,  598,  658,
            724,  796,  876,  963, 1060, 1166, 1282, 1411,
            1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024,
            3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484,
            7132, 7845, 8630, 9493,10442,11487,12635,13899,
            15289,16818,18500,20350,22385,24623,27086,29794,
            32767
        ]

        self.stepSizeAdaption = [
            -1, -1, -1, -1, 2, 4, 6, 8
        ]

        self.prevSample = 0
        self.prevStepSize = 0

    def decode(self, code):
        se = self.prevSample
        stepSizePtr = self.prevStepSize
        step = self.stepSize[stepSizePtr]

        dq = step >> 3
        if (code & 4):
            dq += step
        if (code & 2):
            dq += step >> 1
        if (code & 1):
            dq += step >> 2

        if (code & 8):
            se -= dq
        else:
            se += dq

        if se > 4095:
            se = 4095
        elif se < 0:
            se = 0

        stepSizePtr += self.stepSizeAdaption[code & 0x07]

        if (stepSizePtr < 0):
            stepSizePtr = 0
        if (stepSizePtr > 88):
            stepSizePtr = 88

        self.prevSample = se
        self.prevStepSize = stepSizePtr

        return se
    
    def reset(self):
        self.prevSample = 0
        self.prevStepSize = 0

def get_b64(rec, sr=7500):
    # rec is a list of integers
    # sr is the sample rate
    # returns a base64 encoded string of the recording

    # Convert the recording to a numpy array
    rec = np.array(rec)

    # Normalize the recording from -1 to 1 based on the min and max
    maxAmp = max(np.min(rec), np.max(rec))
    rec = rec / maxAmp

    # Convert the recording to a 16-bit signed integer
    rec = (rec * 32767).astype(np.int16)

    # Convert the recording to a WAV file
    wav = BytesIO()
    wav.write(b'RIFF')
    wav.write(b'\x00\x00\x00\x00')
    wav.write(b'WAVE')
    wav.write(b'fmt ')
    wav.write(b'\x10\x00\x00\x00')
    wav.write(b'\x01\x00')
    wav.write(b'\x01\x00')
    wav.write(sr.to_bytes(4, 'little'))
    wav.write((sr * 2).to_bytes(4, 'little'))
    wav.write(b'\x02\x00')
    wav.write(b'\x10\x00')
    wav.write(b'data')
    wav.write(b'\x00\x00\x00\x00')
    wav.write(rec.tobytes())
    wav.seek(4)
    wav.write((wav.getbuffer().nbytes - 8).to_bytes(4, 'little'))
    wav.seek(40)
    wav.write((wav.getbuffer().nbytes - 44).to_bytes(4, 'little'))

    # Convert the WAV file to a base64 encoded string
    b64 = b64encode(wav.read()).decode('utf-8')
    return b64