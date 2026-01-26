import cv2
import pytesseract
from pytesseract import Output

pytesseract.pytesseract.tesseract_cmd = r"C:/Program Files/Tesseract-OCR/tesseract.exe"

def preprocess_image(image):
    # Upscaling
    scale_factor = 3
    height, width = image.shape[:2]
    scaled_dims = (width * scale_factor, height * scale_factor)
    scaled_img = cv2.resize(image, scaled_dims, interpolation=cv2.INTER_CUBIC)

    # Greyscale
    gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)

    # Adaptive Threshold
    thresh = cv2.adaptiveThreshold(
        gray,
        255, # 0: black 255: white
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, # Gaussian smoother and better for text
        cv2.THRESH_BINARY, # Defines how pixels are assigned
        11, # Block size
        2 # constant C
    )

    # Otsu's Threshold
    val, ostu_thresh = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY | cv2.THRESH_OTSU
    )

    # Morphological operations to clean up
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return thresh, scale_factor

def extract_text(image):
    # Image preprocessing
    processed_image, scale_factor = preprocess_image(image)

    # Tesseract configuration
    # --oem 3: OCR Engine Mode: standard LSTM engine
    # --psm 11: Page Segmentation Mode: sparse text
    # custom_config = f'--oem 3 --psm 6' 

    # Run tesseract to get Data
    data = pytesseract.image_to_data(processed_image, output_type=Output.DICT)
    # data = pytesseract.image_to_data(processed_image, config=custom_config, output_type=Output.DICT)

    results = []
    n_boxes = len(data['text'])

    for i in range(n_boxes):
        # Get text string
        text = data['text'][i].strip()

        # Get confidence score
        conf = int(data['conf'][i]) if data['conf'][i] != '-1' else 0

        # Ignore empty strings and low conf strings
        if text and conf > 30:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            
            results.append({
                "text": text,
                "box": [int(x/scale_factor), int(y/scale_factor), int(w/scale_factor), int(h/scale_factor)],
                "conf": conf
            })

    return results

# Independant testing block
if __name__ == '__main__':
    # Load test image
    test_image_path = "../flowchart_test_images/2sum.png"

    print(f"Testing OCR on {test_image_path}")

    # Check if file exists
    import os
    if not os.path.exists(test_image_path):
        print("Test image not found")
    else:
        img = cv2.imread(test_image_path)

        # Debug: What tesseract sees
        # processed_debug, _ = preprocess_image(img)
        # cv2.imshow("Debug: What tesseract sees", processed_debug)

        detected_text = extract_text(img)

        # Print results
        for item in detected_text:
            print(F"Text: '{item["text"]}' | Confidence: {item["conf"]}% | Box: {item["box"]}")

            # Draw box on image
            x, y, w, h = item['box']
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 2)
        
        cv2.imshow("OCR result", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
