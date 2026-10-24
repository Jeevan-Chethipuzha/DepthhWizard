import os

import cv2
import numpy as np

RESULT_DIR = "results"
os.makedirs(RESULT_DIR, exist_ok=True)


def generate_flythrough(
    image_path: str,
    depth_path: str,
    result_id: int,
) -> str:
    """
    Creates a simple depth-based parallax fly-through video.
    This is suitable for a college-project demonstration.
    """
    image = cv2.imread(image_path)
    depth = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

    if image is None:
        raise ValueError("Input image could not be loaded.")

    if depth is None:
        raise ValueError("Depth map could not be loaded.")

    height, width = image.shape[:2]

    output_path = os.path.join(
        RESULT_DIR,
        f"flythrough_{result_id}.mp4",
    )

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")

    video = cv2.VideoWriter(
        output_path,
        fourcc,
        20.0,
        (width, height),
    )

    if not video.isOpened():
        raise ValueError(
            "Could not create video. Check OpenCV/codec installation."
        )

    map_x_base, map_y = np.meshgrid(
        np.arange(width, dtype=np.float32),
        np.arange(height, dtype=np.float32),
    )

    depth_normalized = depth.astype(np.float32) / 255.0

    try:
        for frame_number in range(60):
            progress = frame_number / 59.0
            camera_shift = (progress - 0.5) * 30.0

            map_x = (
                map_x_base
                + depth_normalized * camera_shift
            )

            frame = cv2.remap(
                image,
                map_x,
                map_y,
                cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REFLECT,
            )

            video.write(frame)
    finally:
        video.release()

    return output_path
