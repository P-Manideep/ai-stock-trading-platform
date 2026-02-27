# ADMIN DASHBOARD - backend/app/routes/admin_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Portfolio, Transaction, StockPrediction

router = APIRouter()

@router.get("/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get platform statistics"""
    
    total_users = db.query(func.count(User.id)).scalar()
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar()
    total_transactions = db.query(func.count(Transaction.id)).scalar()
    total_volume = db.query(func.sum(Transaction.total_amount)).scalar() or 0
    
    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "unverified_users": total_users - verified_users,
        "total_transactions": total_transactions,
        "total_volume": round(total_volume, 2),
        "active_stocks": db.query(func.count(func.distinct(Portfolio.symbol))).scalar()
    }

@router.get("/users")
def get_all_users(
    skip: int = 0, 
    limit: int = 50,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get all registered users"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    user_list = []
    for user in users:
        portfolio_value = sum(
            (p.quantity * p.avg_buy_price) 
            for p in db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        )
        
        user_list.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "mobile": user.mobile,
            "cash_balance": user.cash_balance,
            "portfolio_value": round(portfolio_value, 2),
            "total_assets": round(user.cash_balance + portfolio_value, 2),
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "transaction_count": db.query(func.count(Transaction.id)).filter(
                Transaction.user_id == user.id
            ).scalar()
        })
    
    return {
        "users": user_list,
        "total": db.query(func.count(User.id)).scalar()
    }

@router.get("/transactions")
def get_all_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all platform transactions"""
    transactions = db.query(Transaction).order_by(
        Transaction.timestamp.desc()
    ).offset(skip).limit(limit).all()
    
    trans_list = []
    for t in transactions:
        user = db.query(User).filter(User.id == t.user_id).first()
        trans_list.append({
            "id": t.id,
            "username": user.username if user else "Unknown",
            "symbol": t.symbol,
            "type": t.transaction_type,
            "quantity": t.quantity,
            "price": t.price,
            "total_amount": t.total_amount,
            "timestamp": t.timestamp
        })
    
    return {
        "transactions": trans_list,
        "total": db.query(func.count(Transaction.id)).scalar()
    }

@router.get("/popular-stocks")
def get_popular_stocks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get most traded stocks"""
    popular = db.query(
        Transaction.symbol,
        func.count(Transaction.id).label('trade_count'),
        func.sum(Transaction.quantity).label('total_quantity'),
        func.sum(Transaction.total_amount).label('total_volume')
    ).group_by(Transaction.symbol).order_by(
        func.count(Transaction.id).desc()
    ).limit(10).all()
    
    return [
        {
            "symbol": p.symbol,
            "trade_count": p.trade_count,
            "total_quantity": p.total_quantity,
            "total_volume": round(p.total_volume, 2)
        }
        for p in popular
    ]

@router.delete("/user/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User {user.username} deleted successfully"}