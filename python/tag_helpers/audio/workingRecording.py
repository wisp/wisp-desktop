import eel
import tag_helpers.audio.audioProcessing as audioProcessing

class WorkingRecording:
    def __init__(self):
        self.SAMPLES_PER_TAG = 20
        self.BLOCK_SIZE = 200
        self.SAMPLE_RATE = 8000
        self.SAMPLES_PER_RECORDING = 32000

        # Refreshes before each new recording is captured
        self.rec = []
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_samples = 0
        self.progress = 0

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
            for i in range(0, len(samples)):
                pos = self.SAMPLES_PER_TAG * \
                    (self.BLOCK_SIZE * self.block_counter + seq) + i
                # Add the sample to the recording, repeating the last sample if
                # there are missing samples
                if pos >= len(self.rec):
                    self.rec += [samples[i]] # * (pos - len(self.rec) + 1)

                self.captured_samples += 1

            # self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)
            self.progress = round(self.captured_samples / self.SAMPLES_PER_RECORDING * 100)

        # seq of 255 indicates a completed recording
        elif seq == 255:
            if len(self.rec) > 100:
                time_captured = round(len(self.rec) / self.SAMPLE_RATE, 2)
                if self.progress > 10:
                    print('Captured {}% of recording'.format(self.progress))
                    self.rec_b64 = audioProcessing.get_b64(self.rec, sr=self.SAMPLE_RATE)
                    eel.createAlert('success', "Recording captured", 'A {} second recording was captured with {}% of samples'.format(time_captured, self.progress), 'mic')

            self.clear_capture()

    def get_state(self):
        if len(self.rec) == 0:
            return 'complete'
        return 'incoming'
    
    def get_progress(self):
        return self.progress
    
    def get_recording(self):
        return self.rec_b64
    
    def clear_capture(self):
        self.rec = []
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_samples = 0
        self.progress = 0