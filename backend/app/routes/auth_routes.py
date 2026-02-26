from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, Token, UserResponse
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if not user.email and not user.mobile:
        raise HTTPException(status_code=400, detail="Email or mobile required")
    
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if user.email and db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.mobile and db.query(User).filter(User.mobile == user.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already registered")
    
    db_user = User(
        username=user.username,
        email=user.email,
        mobile=user.mobile,
        hashed_password=get_password_hash(user.password),
        is_verified=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "Registration successful! You can now login.", "user_id": db_user.id}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        (User.username == user.identifier) | 
        (User.email == user.identifier) | 
        (User.mobile == user.identifier)
    ).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your account first")
    
    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(db_user)
    }