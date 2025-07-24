from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.config import get_db
from models.tables import User
import hashlib

profile_router = APIRouter(prefix="/profile", tags=["profile"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class ProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str

class UpdateNameRequest(BaseModel):
    user_id: str
    new_name: str

class UpdatePasswordRequest(BaseModel):
    user_id: str
    old_password: str
    new_password: str

@profile_router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ProfileResponse(user_id=user.user_id, name=user.name, email=user.email)

@profile_router.put("/update-name", response_model=ProfileResponse)
async def update_name(data: UpdateNameRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = data.new_name
    db.commit()
    db.refresh(user)

    return ProfileResponse(user_id=user.user_id, name=user.name, email=user.email)

@profile_router.put("/update-password")
async def update_password(data: UpdatePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.password != hash_password(data.old_password):
        raise HTTPException(status_code=401, detail="Incorrect old password")

    user.password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}
