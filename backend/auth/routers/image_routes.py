import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Image, User
from schemas import ImageResponse
from services.image_validation import validate_image
from services.security import validate_upload_metadata

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/images", tags=["Images"])


@router.post("/upload", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()

    try:
        validate_upload_metadata(file.filename, file.content_type, len(file_bytes))
        width, height, _ = validate_image(
            file_bytes,
            file.content_type or "",
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in {".jpg", ".jpeg", ".png"}:
        extension = ".jpg" if file.content_type == "image/jpeg" else ".png"

    unique_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    image = Image(
        user_id=current_user.id,
        filename=file.filename or unique_filename,
        file_path=file_path,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        width=width,
        height=height,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


@router.get("/my-images", response_model=list[ImageResponse])
def get_my_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Image)
        .filter(Image.user_id == current_user.id)
        .order_by(Image.uploaded_at.desc())
        .all()
    )
