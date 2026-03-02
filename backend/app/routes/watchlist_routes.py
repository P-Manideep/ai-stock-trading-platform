from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_verified_user
from ..models import User, Watchlist, PriceAlert
from ..services.stock_service import get_stock_price

router = APIRouter()

@router.get("/")
def get_watchlist(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    items = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    
    result = []
    for item in items:
        stock_data = get_stock_price(item.symbol)
        if stock_data:
            result.append({
                "id": item.id,
                "symbol": item.symbol,
                "name": stock_data.get('name'),
                "price": stock_data.get('price'),
                "change": stock_data.get('change'),
                "change_percent": stock_data.get('change_percent'),
                "added_at": item.added_at
            })
    
    return {"watchlist": result}

@router.post("/add")
def add_to_watchlist(symbol: str, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == symbol.upper()
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")
    
    item = Watchlist(user_id=current_user.id, symbol=symbol.upper())
    db.add(item)
    db.commit()
    
    return {"message": f"{symbol} added to watchlist"}

@router.delete("/{watchlist_id}")
def remove_from_watchlist(watchlist_id: int, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from watchlist"}