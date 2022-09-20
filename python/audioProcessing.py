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
    # Convert the recording to a WAV file
    wav = wave.open(io.BytesIO(), 'wb')
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sr)
    wav.writeframes(rec.tobytes())
    wav.seek(0)

    # Convert the WAV file to a base64 string
    b64 = base64.b64encode(wav.read()).decode('utf-8')

    return b64