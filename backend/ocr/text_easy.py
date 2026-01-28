import easyocr
import cv2

from .correction import correct_text_batch

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

    raw_data = []

    for (bbox, text) in results:
        # Corner coordinates of each detected text box
        (tl, tr, br, bl) = bbox 

        x = int(tl[0])
        y = int(tl[1])
        w = int(tr[0] - tl[0])
        h = int(br[1] - tr[1])

        raw_data.append({
            "raw_text": text,
            "box": [x, y, w, h],
            "conf": 99
        })

    # Extract text from raw data
    text_strings = [item["raw_text"] for item in raw_data]

    # Send to LLM for cleanup
    if text_strings:
        print("Correcting text with AI")
        cleaned_strings = correct_text_batch(text_strings)

        # Safety check for list length match
        if len(cleaned_strings) == len(raw_data):
            for i in range(len(raw_data)):
                raw_data[i]["text"] = cleaned_strings[i]
        
        else:
            print("AI returned different number of items")
            for item in raw_data:
                # Rename key
                item["text"] = item["raw_text"]
    
    final_results = []
    for item in raw_data:
        final_results.append({
            "text": item.get("text", item["raw_text"]),
            "box": item["box"],
            "conf": item["conf"]
        })

    return final_results

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
