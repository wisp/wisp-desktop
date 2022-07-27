from PIL import Image
from io import BytesIO
import base64
import time


class WorkingImage():
    def __init__(self):
        print('Initializing image class')

        self.WIDTH = 175
        self.HEIGHT = 144
        self.BLOCK_SIZE = 200
        self.PIX_PER_TAG = 10

        self.CLEAR_IMAGE_TIMEOUT = 60

        # Changes for each image
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0
        self.img_b64 = None

        # Keeps track of the last time the image was updated
        self.prev_update_timestamp = 0

    def add_tag(self, seq, adc, pixels):
        # Make sure we're dealing with a new tag
        if seq <= 200 and seq != self.prev_seq:
            # If it's taken more than 20 seconds since the last tag, reset the image
            time = time.time()
            if (time - self.prev_update_timestamp) > self.CLEAR_IMAGE_TIMEOUT:
                self.clear_capture()
                print("Working image went stale, clearing")
            self.prev_update_timestamp = time

            # Increment the block counter if seq jumps down
            if seq < self.prev_seq:
                self.block_counter += 1
            self.prev_seq = seq

            # Add the pixels to the image
            for i in range(0, self.PIX_PER_TAG):
                pos = self.PIX_PER_TAG * \
                    (self.BLOCK_SIZE * self.block_counter + seq) + i
                x = pos % self.WIDTH
                y = pos // self.WIDTH
                if (x < self.WIDTH and y < self.HEIGHT):
                    self.captured_pixels += 1
                    self.img.putpixel((x, y), pixels[i])

        elif seq == 255:
            # Don't bother saving the image if there's less than 25% of the image
            if self.captured_pixels >= (self.WIDTH * self.HEIGHT) * 0.25:
                print('Captured {}% of image'.format(
                    self.captured_pixels / (self.WIDTH * self.HEIGHT) * 100))
                img_buffer = BytesIO()
                self.img.save(img_buffer, format='PNG')
                self.img_b64 = base64.b64encode(
                    img_buffer.getvalue()).decode('ascii')

            self.clear_capture()

    def get_image(self):
        # if (self.sent_img_len != len(self.images)):
        #     self.sent_img_len = len(self.images)
        #     return self.images
        # else:
        #     return None

        return self.img_b64

    def clear_capture(self):
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0
        self.img_b64 = None