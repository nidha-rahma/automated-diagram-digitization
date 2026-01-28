import cv2
import pytesseract
from pytesseract import Output

pytesseract.pytesseract.tesseract_cmd = r"C:/Program Files/Tesseract-OCR/tesseract.exe"

def preprocess_image(image):
    # Upscaling
    scale_factor = 2
    height, width = image.shape[:2]
    scaled_dims = (width * scale_factor, height * scale_factor)
    scaled_img = cv2.resize(image, scaled_dims, interpolation=cv2.INTER_LANCZOS4)

    # Greyscale
    gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)

    return gray, scale_factor

def extract_text(image):
    # Image preprocessing
    processed_image, scale_factor = preprocess_image(image)

    # Tesseract configuration
    # --oem 3: OCR Engine Mode: standard LSTM engine
    # --psm 11: Page Segmentation Mode: sparse text
    custom_config = f'--oem 3 --psm 12' 

    # Run tesseract to get Data
    data = pytesseract.image_to_data(processed_image, config=custom_config, output_type=Output.DICT)

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
    test_image_path = "../flowchart_test_images/test_1.jpeg"

    print(f"Testing OCR on {test_image_path}")

    # Check if file exists
    import os
    if not os.path.exists(test_image_path):
        print("Test image not found")
    else:
        img = cv2.imread(test_image_path)

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
