from base64 import b64encode
from io import BytesIO
from PIL import ImageEnhance, ImageStat, Image, ImageOps
import cv2
import numpy as np

def get_b64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return (b64encode(buffered.getvalue()).decode())

def auto_brightness(img):
    img = ImageOps.autocontrast(img)
    return img

def inpaint(image):
    image = np.array(image)
    (T, mask) = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV)
    image = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
    image = Image.fromarray(image)
    return image

def get_b64_brighten(image):
    image = inpaint(image)
    image_brightened = auto_brightness(image)
    return (get_b64(image_brightened))