import eel
import audioProcessing

class workingRecording:
    def __init__(self):

        self.SAMPLES_PER_TAG = 10
        self.BLOCK_SIZE = 200
        self.SAMPLE_RATE = 7500

        
        # Refreshes before each new recording is captured
        self.rec = []
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_samples = 0

        # Refreshes after each new recording is captured
        self.rec_b64 = None

    def add_tag(self, seq, adc, samples):
        if seq <= 200 and seq != self.prev_seq:
            # Remove the old recording
            self.rec_b64 = None

            # Increment the block counter if seq jumps down
            if seq < self.prev_seq:
                self.block_counter += 1
            self.prev_seq = seq

            # Add the samples to the recording
            for i in range(0, self.SAMPLES_PER_TAG):
                pos = self.SAMPLES_PER_TAG * \
                    (self.BLOCK_SIZE * self.block_counter + seq) + i
                # Add the sample to the recording, filling in zeros if pos is out of range
                decoded = audioProcessing.ADPCM.decode(samples[i])
                if pos < len(self.rec):
                    self.rec[pos] = decoded
                else:
                    # Fill in zeros
                    self.rec += [0] * (pos - len(self.rec))
                    self.rec.append(decoded)

                self.captured_samples += 1

            self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)

        elif seq == 255:
            percent_captured = round((self.captured_samples / len(self.rec)) * 100)

            if percent_captured > 50:
                print('Captured {}% of recording'.format(percent_captured))
                eel.createAlert('success', "Recording captured", 'A recording was captured with {}% of samples'.format(percent_captured), 'mic')
                self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)

            self.clear_capture()

    def get_state(self):
        if self.rec is None:
            return 'complete'
        return 'incoming'
    
    def get_recording(self):
        return self.rec_b64
    
    def clear_capture(self):
        self.rec = []
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_samples = 0
        audioProcessing.ADPCM.reset()