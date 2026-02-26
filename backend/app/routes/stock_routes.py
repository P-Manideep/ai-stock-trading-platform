from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_verified_user
from ..models import User
from ..schemas import StockPrice
from ..services.stock_service import get_stock_price, search_stocks, get_multiple_stocks

router = APIRouter()

@router.get("/search")
def search_stocks_endpoint(q: str, current_user: User = Depends(get_verified_user)):
    results = search_stocks(q)
    return {"results": results}

@router.get("/price/{symbol}", response_model=StockPrice)
def get_stock_price_endpoint(symbol: str, current_user: User = Depends(get_verified_user)):
    data = get_stock_price(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")
    return data

@router.post("/prices", response_model=List[StockPrice])
def get_multiple_prices(symbols: List[str], current_user: User = Depends(get_verified_user)):
    results = get_multiple_stocks(symbols)
    return results

@router.get("/trending")
def get_trending_stocks(current_user: User = Depends(get_verified_user)):
    trending = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "JPM"]
    results = get_multiple_stocks(trending)
    return {"stocks": results}