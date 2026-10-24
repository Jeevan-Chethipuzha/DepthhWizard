"""Reusable SQLAlchemy helpers for database transactions and ownership checks."""
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def commit_or_rollback(db: Session) -> None:
    """Commit a transaction; roll back and re-raise if the commit fails."""
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise


def get_owned_record(db: Session, model, record_id: int, user_id: int):
    """Return a record only when it belongs to the requested user."""
    return db.query(model).filter(model.id == record_id, model.user_id == user_id).first()
