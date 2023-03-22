# from base64 import b64encode
# from io import BytesIO
import numpy as np
from io import BytesIO
from base64 import b64encode

def lowpass_filter(data, bandlimit=3999, sampling_rate=8000):
    bandlimit_index = int(bandlimit * data.size / sampling_rate)
    freq = np.fft.fft(data)

    # Zero out all frequencies above the bandlimit
    freq[bandlimit_index+1 : -bandlimit_index] = 0

    data_filtered = np.fft.ifft(freq)
    return np.real(data_filtered)

def get_b64(rec, sr=8000):
    # rec is a list of integers
    # sr is the sample rate
    # returns a base64 encoded string of the recording

    # Convert the recording to a numpy array
    rec = np.array(rec)

    # Normalize the recording from -1 to 1 based on the min and max
    maxAmp = max(abs(np.min(rec)), abs(np.max(rec)))
    rec = rec / maxAmp

    # Lowpass filter the recording
    rec = lowpass_filter(rec)

    # Convert the recording to a 8-bit unsigned integer
    rec = (rec * 127.5 + 127.5).astype(np.uint8)

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
    wav.write(b'\x01\x00') 
    wav.write(b'data')
    wav.write(b'\x00\x00\x00\x00')
    wav.write(rec.tobytes())
    wav.seek(4)
    wav.write((wav.getbuffer().nbytes - 8).to_bytes(4, 'little'))
    wav.seek(40)
    wav.write((wav.getbuffer().nbytes - 44).to_bytes(4, 'little'))
    wav.seek(0)

    # Convert the WAV file to a base64 encoded string
    b64 = b64encode(wav.read()).decode('utf-8')
    return b64
