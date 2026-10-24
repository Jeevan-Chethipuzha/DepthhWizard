from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
from database import get_db
from models import Result, User
from services.geospatial_processing import summarize_depth_map

router = APIRouter(prefix="/geospatial", tags=["Elevation & Geospatial Processing"])


@router.get("/results/{result_id}/elevation-summary")
def elevation_summary(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return relative-depth statistics for a completed result owned by the user."""
    result = db.query(Result).filter(
        Result.id == result_id, Result.user_id == current_user.id
    ).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found.")
    if result.status != "completed" or not result.depth_map_path:
        raise HTTPException(status_code=409, detail="Depth map is not available yet.")
    try:
        return {
            "result_id": result.id,
            "image_id": result.image_id,
            "processing_type": "relative_depth_summary",
            **summarize_depth_map(result.depth_map_path),
        }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
