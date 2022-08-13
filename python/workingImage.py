from PIL import Image
import countPeople


class WorkingImage():
    def __init__(self):
        print('Initializing image class')

        self.WIDTH = 175
        self.HEIGHT = 144
        self.BLOCK_SIZE = 200
        self.PIX_PER_TAG = 10

        # Refreshes before each new image is captured
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0

        # Refreshes after each new image is captured
        self.img_b64 = None
        self.person_count = None

    def add_tag(self, seq, adc, pixels):
        # Make sure we're dealing with a new tag
        if seq <= 200 and seq != self.prev_seq:
            # If it's taken more than 20 seconds since the last tag, reset the image
            # time = time.time()
            # if (time - self.prev_update_timestamp) > self.CLEAR_IMAGE_TIMEOUT:
            #     self.clear_capture()
            #     print("Working image went stale, clearing")
            # self.prev_update_timestamp = time
            
            # Remove the old image
            self.img_b64 = None

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
                (count, b64) = countPeople.count_people(self.img)
                self.img_b64 = b64
                self.person_count = count

            self.clear_capture()

    def get_image(self):
        return self.img_b64

    def get_person_count(self):
        return self.person_count

    def clear_capture(self):
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0