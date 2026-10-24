"""Elevation and geospatial processing utilities for DepthWizard."""
from pathlib import Path
from typing import Any
import numpy as np
from PIL import Image


def summarize_depth_map(depth_map_path: str) -> dict[str, Any]:
    """Return normalized statistics for a generated grayscale depth map.

    The current baseline model produces relative depth, not absolute terrain elevation.
    Metric elevation requires georeferencing and reliable reference/scale data.
    """
    path = Path(depth_map_path)
    if not path.is_file():
        raise FileNotFoundError("Depth map file was not found.")
    try:
        with Image.open(path) as image:
            values = np.asarray(image.convert("L"), dtype=np.float32)
    except (OSError, ValueError) as exc:
        raise ValueError("Depth map could not be read as an image.") from exc
    if values.size == 0 or values.ndim != 2 or not np.isfinite(values).all():
        raise ValueError("Depth map contains invalid or empty data.")
    normalized = values / 255.0
    height, width = values.shape
    return {
        "width": int(width), "height": int(height),
        "value_min": round(float(normalized.min()), 4),
        "value_max": round(float(normalized.max()), 4),
        "value_mean": round(float(normalized.mean()), 4),
        "value_range": round(float(normalized.max() - normalized.min()), 4),
        "units": "normalized_relative_depth",
        "absolute_elevation_available": False,
        "note": "These values represent relative depth, not real-world elevation. Georeferencing and reference elevation data are required for metric elevation."
    }
