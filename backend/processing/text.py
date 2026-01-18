import cv2
import pytesseract
from pytesseract import Output

pytesseract.pytesseract.tesseract_cmd = r"C:/Program Files/Tesseract-OCR/tesseract.exe"

def extract_text(image):
    # Image preprocessing
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


    # Run tesseract to get Data
    data = pytesseract.image_to_data(gray, output_type=Output.DICT)

    results = []
    n_boxes = len(data['text'])

    for i in range(n_boxes):
        # Get text string
        text = data['text'][i].strip()

        # Get confidence score
        conf = int(data['conf'][i]) if data['conf'][i] != '-1' else 0

        # Ignore empty strings and low conf strings
        if text and conf > 40:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            
            results.append({
                "text": text,
                "box": [x, y, w, h],
                "conf": conf
            })

    return results

# Independant testing block
if __name__ == '__main__':
    # Load test image
    test_image_path = "../../flowchart_test_images/2sum.png"

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
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 255), 1)
        
        cv2.imshow("OCR result", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
