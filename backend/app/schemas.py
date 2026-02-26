from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re

class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: str
    
    @field_validator('mobile')
    def validate_mobile(cls, v):
        if v and not re.match(r'^\+?1?\d{10,14}$', v):
            raise ValueError('Invalid mobile number format')
        return v

class UserLogin(BaseModel):
    identifier: str
    password: str

class OTPRequest(BaseModel):
    identifier: str
    otp_type: str

class OTPVerify(BaseModel):
    identifier: str
    otp_code: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    mobile: Optional[str]
    cash_balance: float
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PortfolioItem(BaseModel):
    symbol: str
    quantity: int
    avg_buy_price: float
    current_price: Optional[float] = None
    total_value: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None
    
    class Config:
        from_attributes = True

class TradeRequest(BaseModel):
    symbol: str
    quantity: int

class TransactionResponse(BaseModel):
    id: int
    symbol: str
    transaction_type: str
    quantity: int
    price: float
    total_amount: float
    timestamp: datetime
    
    class Config:
        from_attributes = True

class StockPrice(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    timestamp: datetime

class StockPredictionResponse(BaseModel):
    symbol: str
    current_price: float
    predicted_price: float
    confidence: float
    trend: str
    prediction_date: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None