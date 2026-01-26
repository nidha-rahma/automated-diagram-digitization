import cv2
import os
import logging

def preprocess_image(image_path, output_dir="outputs", show=False, save=True):
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        logging.error("❌ Image not found at:%s", image_path)
        return None

    # Create output directory if needed
    if save:
        os.makedirs(output_dir, exist_ok=True)

    # Preprocessing steps
    img_resized = cv2.resize(img, (224, 224))
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    #blur = cv2.GaussianBlur(gray, (5,5), 0)
    enhanced = cv2.equalizeHist(gray)
    _, binary = cv2.threshold(enhanced, 127, 255, cv2.THRESH_BINARY)
    edges = cv2.Canny(gray, 100, 200)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    clean = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

    # Show images
    if show:
        cv2.imshow("Original", img_resized)
        cv2.imshow("Gray", gray)
        cv2.imshow("Binary", binary)
        cv2.imshow("Edges", edges)
        cv2.imshow("Clean", clean)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    # Save images
    if save:
        base = os.path.splitext(os.path.basename(image_path))[0]
        cv2.imwrite(os.path.join(output_dir, f"{base}_gray.png"), gray)
        cv2.imwrite(os.path.join(output_dir, f"{base}_binary.png"), binary)
        cv2.imwrite(os.path.join(output_dir, f"{base}_edges.png"), edges)
        cv2.imwrite(os.path.join(output_dir, f"{base}_clean.png"), clean)

    logging.info("✅ Preprocessing completed for:%s", image_path)

    return {
        "original": img_resized,
        "gray": gray,
        "binary": binary,
        "edges": edges,
        "clean": clean
    }
