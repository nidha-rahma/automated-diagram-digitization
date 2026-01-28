import easyocr
import cv2

reader = easyocr.Reader(['en'], gpu=False)

def extract_text(image):
    allowed_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:+-=()[]/ '

    results = reader.readtext(
        image,
        allowlist=allowed_chars,
        mag_ratio=2.0,       
        low_text=0.3,        
        text_threshold=0.4,
        link_threshold=0.1,
        paragraph=True
    )

    formatted_results = []

    for (bbox, text) in results:
        # Corner coordinates of each detected text box
        (tl, tr, br, bl) = bbox 

        x = int(tl[0])
        y = int(tl[1])
        w = int(tr[0] - tl[0])
        h = int(br[1] - tr[1])

        formatted_results.append({
            "text": text,
            "box": [x, y, w, h],
            "conf": 99
        })
    
    return formatted_results

# Independant testing block
if __name__ == '__main__':
    # Load test image
    test_image_path = "../flowchart_test_images/monitor.png"

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
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 0), 2)
        
        cv2.imshow("EasyOCR result", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
