from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class ImageResponse(BaseModel):
    id: int
    filename: str
    width: int
    height: int
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ResultResponse(BaseModel):
    id: int
    image_id: int
    depth_map_path: Optional[str] = None
    flythrough_path: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
