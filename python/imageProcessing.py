from base64 import b64encode
from io import BytesIO
from PIL import ImageEnhance, ImageStat

def get_b64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return (b64encode(buffered.getvalue()).decode())

def auto_brightness(img):
    ave_brightness = ImageStat.Stat(img).mean[0]
    brightness_value = 80 / ave_brightness
    if brightness_value > 1:
        img = ImageEnhance.Brightness(img).enhance(brightness_value)
    return img

def get_b64_brighten(image):
    image_brightened = auto_brightness(image)
    return (get_b64(image_brightened))