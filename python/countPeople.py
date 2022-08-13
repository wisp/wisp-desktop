import cv2
import numpy as np
import base64
# import eel

# DO_OCCUPANCY_COUNT = False

# if (DO_OCCUPANCY_COUNT):
#     import tensorflow as tf
#     import tensorflow_hub as hub

#     print("Loading TF model...")
#     detector = hub.load("https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2")
#     print("Done loading TF model")

def increase_brightness(img, value):
    img_brightened = np.where((255 / img) < value,255,(img*value).astype("uint8"))
    return img_brightened

def count_people(image):
    # STEP 1: Convert PIL image to numpy array
    image = np.array(image)

    # STEP 2: Brighten the image if needed
    ave_brightness = np.mean(image)
    brightness_value = 80 / ave_brightness
    if brightness_value > 1:
        print("Brightening the image by {}".format(brightness_value))
        image = increase_brightness(image, brightness_value)

    # STEP 2: Generate a mask for missing pixels
    #         Fill these with standard image inpainting
    (T, missing_mask) = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV)
    image = cv2.inpaint(image, missing_mask, 3, cv2.INPAINT_TELEA)
    image_gray = image.copy()

    count = 0

    # if (DO_OCCUPANCY_COUNT):
    #     # STEP 3: Convert grayscale to 3 channel RGB for the detector
    #     #         Reshape to match the detector input
    #     image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    #     (w, h, c) = image.shape
    #     image = tf.convert_to_tensor(image)
    #     image = tf.reshape(image, [1,w,h,3])

    #     # STEP 4: Run the detector
    #     #         Draw bounding boxes around the detected objects
    #     results = detector(image)
    #     detections = len(results["detection_classes"][0])
    #     count = 0
    #     for i in range(detections):
    #         if results["detection_classes"][0][i] == 1:
    #             # print("Person detected with confidence: " + str(results["detection_scores"][0][i]))
    #             if results["detection_scores"][0][i] > 0.40:
    #                 count += 1
    #                 rect = results["detection_boxes"][0][i].numpy()
    #                 start = (int(rect[1] * w), int(rect[0] * h))
    #                 end = (int(rect[3] * w), int(rect[2] * h))
    #                 image_gray = cv2.rectangle(image_gray, start, end, 255, 1)
    #     print("Count: {}".format(count))

    buffer = cv2.imencode('.png', image_gray)[1]
    b64 = base64.b64encode(buffer)
    return (count, b64.decode())