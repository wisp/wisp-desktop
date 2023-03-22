from PIL import Image
import tag_helpers.image.imageProcessing as imageProcessing
import eel

class WorkingImage():
    def __init__(self):
        print('Initializing image class')

        self.WIDTH = 162
        self.HEIGHT = 122
        
        self.BLOCK_SIZE = 200
        self.PIX_PER_TAG = 10

        self.state = 'none'

        # Refreshes before each new image is captured
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0

        # Refreshes after each new image is captured
        self.img_b64 = None
        self.person_count = None

    def add_tag(self, seq, adc, pixels):
        try:
            # Make sure we're dealing with a new tag
            if seq <= 200 and seq != self.prev_seq:
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
                        self.state = 'incoming'

                if (self.captured_pixels % 2000 < 10):
                    self.img_b64 = imageProcessing.get_b64(self.img)

            elif seq == 255:
                percent_captured = round(self.captured_pixels / (self.WIDTH * self.HEIGHT) * 100)

                if percent_captured > 50:
                    print('Captured {}% of image'.format(percent_captured))
                    eel.createAlert('success', "Image captured", 'An image was captured with {}% of pixels'.format(percent_captured), 'photo_camera')
                    self.img_b64 = imageProcessing.get_b64_brighten(self.img)
                    self.state = 'complete'

                self.clear_capture()
        except Exception as e:
            print('Error adding image tag: {}'.format(e))

    def get_state(self):
        return self.state

    def get_image(self):
        image = self.img_b64
        self.img_b64 = None
        return image

    def get_person_count(self):
        return self.person_count

    def clear_capture(self):
        self.img = Image.new('L', (self.WIDTH, self.HEIGHT), )
        self.block_counter = 0
        self.prev_seq = 0
        self.captured_pixels = 0