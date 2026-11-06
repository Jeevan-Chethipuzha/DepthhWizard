import hashlib
import hmac
import os
import secrets
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage

from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import get_db
from models import PasswordReset, User
from schemas import Token, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user or not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(min_length=6, max_length=100)


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()

    # Do not reveal whether an email address has an account.
    if not user:
        return {"message": "If an account exists, a reset code has been sent."}

    code = f"{secrets.randbelow(1000000):06d}"
    code_hash = hashlib.sha256(code.encode()).hexdigest()

    reset = PasswordReset(
        user_id=user.id,
        code_hash=code_hash,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )

    try:
        db.add(reset)
        db.flush()

        message = EmailMessage()
        message["Subject"] = "Your DepthWizard password reset code"
        message["From"] = os.environ["SMTP_FROM_EMAIL"]
        message["To"] = user.email
        message.set_content(
            f"Your DepthWizard password reset code is: {code}\n\n"
            "This code expires in 10 minutes and can only be used once. "
            "If you did not request this, ignore this email."
        )

        host = os.environ["SMTP_HOST"]
        port = int(os.getenv("SMTP_PORT", "587"))
        username = os.environ["SMTP_USERNAME"]
        password = os.environ["SMTP_PASSWORD"]

        with smtplib.SMTP(host, port, timeout=20) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(message)

        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="Unable to send the reset email. Please try again later.",
        )

    return {"message": "If an account exists, a reset code has been sent."}


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    reset = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.user_id == user.id,
            PasswordReset.used_at.is_(None),
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )

    if not reset or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    if reset.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new code.")

    submitted_hash = hashlib.sha256(data.code.encode()).hexdigest()

    if not hmac.compare_digest(submitted_hash, reset.code_hash):
        reset.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    user.password_hash = hash_password(data.new_password)
    reset.used_at = datetime.utcnow()
    db.commit()

    return {"message": "Password changed successfully. You can now log in."}
