"""Security helpers for safe upload handling."""
import os
from pathlib import Path
from typing import Optional

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


def validate_upload_metadata(filename: Optional[str], content_type: Optional[str], size: int) -> None:
    """Validate upload metadata before image decoding/validation."""
    if not filename or Path(filename).name != filename or filename in {".", ".."}:
        raise ValueError("Invalid filename.")
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError("Only JPEG and PNG images are supported.")
    if size <= 0:
        raise ValueError("Uploaded file is empty.")
    if size > MAX_UPLOAD_BYTES:
        raise ValueError("Uploaded file exceeds the configured upload size limit.")
