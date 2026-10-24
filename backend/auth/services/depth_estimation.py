import os

import cv2
import numpy as np

RESULT_DIR = "results"
os.makedirs(RESULT_DIR, exist_ok=True)


def generate_depth_map(image_path: str, result_id: int) -> str:
    """
    College-project baseline depth estimator.

    It creates a normalized grayscale depth map from image luminance.
    This function is intentionally isolated so it can later be replaced
    with Depth Anything / MiDaS / another pretrained model.
    """
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Unable to read input image.")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Mild blur reduces noise before normalization.
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    depth = cv2.normalize(
        gray,
        None,
        0,
        255,
        cv2.NORM_MINMAX,
    ).astype(np.uint8)

    output_path = os.path.join(
        RESULT_DIR,
        f"depth_{result_id}.png",
    )

    if not cv2.imwrite(output_path, depth):
        raise ValueError("Failed to save depth map.")

    return output_path
