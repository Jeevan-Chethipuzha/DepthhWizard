from io import BytesIO

from PIL import Image, UnidentifiedImageError

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MIN_WIDTH = 256
MIN_HEIGHT = 256


def validate_image(file_bytes: bytes, content_type: str):
    if content_type not in ALLOWED_TYPES:
        raise ValueError("Only JPG, JPEG and PNG images are allowed.")

    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("Maximum image size is 10 MB.")

    try:
        with Image.open(BytesIO(file_bytes)) as image:
            image.verify()

        with Image.open(BytesIO(file_bytes)) as image:
            width, height = image.size
            image_format = image.format

    except (UnidentifiedImageError, OSError):
        raise ValueError("Invalid or corrupted image.")

    if width < MIN_WIDTH or height < MIN_HEIGHT:
        raise ValueError(
            f"Image must be at least {MIN_WIDTH}x{MIN_HEIGHT} pixels."
        )

    return width, height, image_format
