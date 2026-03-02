# CREATE NEW FILE: app/routes/watchlist_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_verified_user
from ..models import User, Watchlist, PriceAlert
from ..services.stock_service import get_stock_price

router = APIRouter()

@router.get("/")
def get_watchlist(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    """Get user watchlist"""
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
    """Add stock to watchlist"""
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
    """Remove from watchlist"""
    item = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from watchlist"}

@router.get("/alerts")
def get_alerts(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    """Get price alerts"""
    alerts = db.query(PriceAlert).filter(
        PriceAlert.user_id == current_user.id,
        PriceAlert.is_active == True
    ).all()
    
    return {"alerts": [
        {
            "id": a.id,
            "symbol": a.symbol,
            "target_price": a.target_price,
            "condition": a.condition,
            "triggered": a.triggered,
            "created_at": a.created_at
        }
        for a in alerts
    ]}

@router.post("/alerts")
def create_alert(
    symbol: str,
    target_price: float,
    condition: str,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    """Create price alert"""
    if condition not in ['above', 'below']:
        raise HTTPException(status_code=400, detail="Condition must be 'above' or 'below'")
    
    alert = PriceAlert(
        user_id=current_user.id,
        symbol=symbol.upper(),
        target_price=target_price,
        condition=condition
    )
    db.add(alert)
    db.commit()
    
    return {"message": f"Alert created for {symbol}"}

@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    """Delete alert"""
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id,
        PriceAlert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(alert)
    db.commit()
    
    return {"message": "Alert deleted"}
