import eel
import tag_helpers.audio.audioProcessing as audioProcessing

class WorkingRecording:
    def __init__(self):
        self.SAMPLES_PER_TAG = 20
        self.BLOCK_SIZE = 200
        self.SAMPLE_RATE = 9370
        self.ADPCM = audioProcessing.ADPCM()

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
                # Add the sample to the recording, repeating the last sample if
                # there are missing samples
                decoded = self.ADPCM.decode(samples[i])
                if pos >= len(self.rec):
                    self.rec += [decoded] * (pos - len(self.rec) + 1)

                self.captured_samples += 1

            # self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)
            # self.rec_b64 = self.recString

        # seq of 255 indicates a completed recording
        elif seq == 255:
            if len(self.rec) > 100:
                time_captured = round(len(self.rec) / self.SAMPLE_RATE, 2)
                percent_captured = round((self.captured_samples / len(self.rec)) * 100)
                if percent_captured > 50:
                    print('Captured {}% of recording'.format(percent_captured))
                    self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)
                    eel.createAlert('success', "Recording captured", 'A {} second recording was captured with {}% of samples'.format(time_captured, percent_captured), 'mic')

            self.clear_capture()

    def get_state(self):
        if len(self.rec) == 0:
            return 'complete'
        return 'incoming'
    
    def get_recording(self):
        return self.rec_b64
    
    def clear_capture(self):
        self.rec = []
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_samples = 0
        self.ADPCM.reset()