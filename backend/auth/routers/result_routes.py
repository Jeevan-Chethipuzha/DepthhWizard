import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Image, Result, User
from schemas import ResultResponse
from services.depth_estimation import generate_depth_map
from services.flythrough import generate_flythrough

router = APIRouter(prefix="/results", tags=["Results"])


@router.post(
    "/generate/{image_id}",
    response_model=ResultResponse,
)
def generate_result(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image = (
        db.query(Image)
        .filter(
            Image.id == image_id,
            Image.user_id == current_user.id,
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found.",
        )

    existing = (
        db.query(Result)
        .filter(
            Result.image_id == image.id,
            Result.user_id == current_user.id,
        )
        .first()
    )

    if existing and existing.status == "completed":
        return existing

    result = Result(
        user_id=current_user.id,
        image_id=image.id,
        status="processing",
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    try:
        depth_path = generate_depth_map(
            image.file_path,
            result.id,
        )

        flythrough_path = generate_flythrough(
            image.file_path,
            depth_path,
            result.id,
        )

        result.depth_map_path = depth_path
        result.flythrough_path = flythrough_path
        result.status = "completed"
        result.completed_at = datetime.utcnow()

        db.commit()
        db.refresh(result)

        return result

    except Exception as error:
        result.status = "failed"
        result.error_message = str(error)

        db.commit()
        db.refresh(result)

        return result


@router.get("", response_model=list[ResultResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Result)
        .filter(Result.user_id == current_user.id)
        .order_by(Result.created_at.desc())
        .all()
    )


@router.get("/{result_id}", response_model=ResultResponse)
def get_result(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = (
        db.query(Result)
        .filter(
            Result.id == result_id,
            Result.user_id == current_user.id,
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    return result


@router.delete("/{result_id}")
def delete_result(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = (
        db.query(Result)
        .filter(
            Result.id == result_id,
            Result.user_id == current_user.id,
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Result not found.",
        )

    # Remove generated files if they exist.
    for path in (
        result.depth_map_path,
        result.flythrough_path,
    ):
        if path and os.path.exists(path):
            os.remove(path)

    db.delete(result)
    db.commit()

    return {"message": "Result deleted successfully."}
