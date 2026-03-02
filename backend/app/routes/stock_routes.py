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
@router.get("/sectors")
def get_all_sectors(current_user: User = Depends(get_verified_user)):
    """Get all available sectors"""
    from ..services.stock_service import SECTORS
    return {"sectors": SECTORS}

@router.get("/exchanges")
def get_all_exchanges(current_user: User = Depends(get_verified_user)):
    """Get all exchanges"""
    from ..services.stock_service import EXCHANGES
    return {"exchanges": EXCHANGES}

@router.get("/sector/{sector}")
def get_sector_stocks(sector: str, current_user: User = Depends(get_verified_user)):
    """Get stocks by sector"""
    from ..services.stock_service import get_stocks_by_sector
    return {"stocks": get_stocks_by_sector(sector)}

@router.get("/gainers")
def get_top_gainers_route(current_user: User = Depends(get_verified_user)):
    """Get top gainers"""
    from ..services.stock_service import get_top_gainers
    return {"stocks": get_top_gainers()}

@router.get("/losers")
def get_top_losers_route(current_user: User = Depends(get_verified_user)):
    """Get top losers"""
    from ..services.stock_service import get_top_losers
    return {"stocks": get_top_losers()}

@router.get("/{symbol}/news")
def get_stock_news_route(symbol: str, current_user: User = Depends(get_verified_user)):
    """Get news for a stock"""
    from ..services.news_service import get_stock_news
    return {"news": get_stock_news(symbol)}

@router.get("/market/news")
def get_market_news_route(current_user: User = Depends(get_verified_user)):
    """Get general market news"""
    from ..services.news_service import get_market_news
    return {"news": get_market_news()}
@router.get("/gainers")
def get_top_gainers_route(current_user: User = Depends(get_verified_user)):
    """Get top gainers"""
    from ..services.stock_service import get_top_gainers
    return {"stocks": get_top_gainers()}

@router.get("/losers")
def get_top_losers_route(current_user: User = Depends(get_verified_user)):
    """Get top losers"""
    from ..services.stock_service import get_top_losers
    return {"stocks": get_top_losers()}

@router.get("/{symbol}/news")
def get_stock_news_route(symbol: str, current_user: User = Depends(get_verified_user)):
    """Get news for a stock"""
    from ..services.news_service import get_stock_news
    return {"news": get_stock_news(symbol)}