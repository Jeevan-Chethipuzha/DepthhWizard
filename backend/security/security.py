
from pathlib import Path
from werkzeug.exceptions import BadRequest

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_required_fields(data, required_fields):
    """Validate required JSON fields."""
    if not isinstance(data, dict):
        raise BadRequest("Request data must be a JSON object.")

    for field in required_fields:
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            raise BadRequest(f"Missing or invalid field: {field}")

    return True


def validate_image_upload(file):
    """Check an uploaded image's name, extension and size."""
    if file is None or not file.filename:
        return False, "No image file provided."

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        return False, "Unsupported image file type."

    file.stream.seek(0, 2)
    size = file.stream.tell()
    file.stream.seek(0)

    if size == 0:
        return False, "The uploaded file is empty."

    if size > MAX_FILE_SIZE:
        return False, "Image must not exceed 10 MB."

    return True, "File passed basic validation."


def safe_error_response(status_code):
    """Return safe messages without exposing internal errors."""
    messages = {
        400: "Invalid request. Check your input.",
        401: "Authentication is required.",
        403: "You are not authorized.",
        404: "Resource not found.",
        413: "Uploaded file is too large.",
        500: "An internal server error occurred."
    }

    return {
        "success": False,
        "error": messages.get(status_code, "Request failed.")
    }, status_code
