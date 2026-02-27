from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_verified_user
from ..models import User, Portfolio, Transaction
from ..schemas import PortfolioItem, TradeRequest, TransactionResponse
from ..services.stock_service import get_stock_price

router = APIRouter()

@router.get("/", response_model=List[PortfolioItem])
def get_portfolio(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    holdings = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    
    result = []
    for holding in holdings:
        stock_data = get_stock_price(holding.symbol)
        current_price = stock_data['price'] if stock_data else holding.avg_buy_price
        
        total_value = current_price * holding.quantity
        cost_basis = holding.avg_buy_price * holding.quantity
        profit_loss = total_value - cost_basis
        profit_loss_percent = (profit_loss / cost_basis) * 100 if cost_basis > 0 else 0
        
        result.append({
            "symbol": holding.symbol,
            "quantity": holding.quantity,
            "avg_buy_price": holding.avg_buy_price,
            "current_price": current_price,
            "total_value": round(total_value, 2),
            "profit_loss": round(profit_loss, 2),
            "profit_loss_percent": round(profit_loss_percent, 2)
        })
    
    return result

@router.get("/value")
def get_portfolio_value(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    holdings = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    
    total_value = 0
    for holding in holdings:
        stock_data = get_stock_price(holding.symbol)
        if stock_data:
            total_value += stock_data['price'] * holding.quantity
        else:
            total_value += holding.avg_buy_price * holding.quantity
    
    total_assets = total_value + current_user.cash_balance
    
    return {
        "cash_balance": round(current_user.cash_balance, 2),
        "stocks_value": round(total_value, 2),
        "total_value": round(total_assets, 2)
    }

@router.post("/buy")
def buy_stock(trade: TradeRequest, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    stock_data = get_stock_price(trade.symbol)
    
    if not stock_data:
        raise HTTPException(
            status_code=404, 
            detail=f"Unable to fetch price for {trade.symbol}. Try another stock."
        )
    
    if stock_data['price'] <= 0:
        raise HTTPException(status_code=400, detail="Invalid stock price")
    
    total_cost = stock_data['price'] * trade.quantity
    
    if current_user.cash_balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    current_user.cash_balance -= total_cost
    
    holding = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.symbol == trade.symbol.upper()
    ).first()
    
    if holding:
        total_shares = holding.quantity + trade.quantity
        total_cost_basis = (holding.avg_buy_price * holding.quantity) + (stock_data['price'] * trade.quantity)
        holding.avg_buy_price = total_cost_basis / total_shares
        holding.quantity = total_shares
    else:
        holding = Portfolio(
            user_id=current_user.id,
            symbol=trade.symbol.upper(),
            quantity=trade.quantity,
            avg_buy_price=stock_data['price']
        )
        db.add(holding)
    
    transaction = Transaction(
        user_id=current_user.id,
        symbol=trade.symbol.upper(),
        transaction_type="BUY",
        quantity=trade.quantity,
        price=stock_data['price'],
        total_amount=total_cost
    )
    db.add(transaction)
    db.commit()
    
    return {
        "message": "Purchase successful",
        "symbol": trade.symbol.upper(),
        "quantity": trade.quantity,
        "price": stock_data['price'],
        "total_cost": round(total_cost, 2),
        "remaining_balance": round(current_user.cash_balance, 2)
    }

@router.post("/sell")
def sell_stock(trade: TradeRequest, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    holding = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.symbol == trade.symbol.upper()
    ).first()
    
    if not holding or holding.quantity < trade.quantity:
        raise HTTPException(status_code=400, detail="Insufficient shares")
    
    stock_data = get_stock_price(trade.symbol)
    if not stock_data:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    total_value = stock_data['price'] * trade.quantity
    
    current_user.cash_balance += total_value
    holding.quantity -= trade.quantity
    
    if holding.quantity == 0:
        db.delete(holding)
    
    transaction = Transaction(
        user_id=current_user.id,
        symbol=trade.symbol.upper(),
        transaction_type="SELL",
        quantity=trade.quantity,
        price=stock_data['price'],
        total_amount=total_value
    )
    db.add(transaction)
    db.commit()
    
    return {
        "message": "Sale successful",
        "symbol": trade.symbol.upper(),
        "quantity": trade.quantity,
        "price": stock_data['price'],
        "total_value": round(total_value, 2),
        "new_balance": round(current_user.cash_balance, 2)
    }
@router.get("/analytics")
def get_portfolio_analytics_route(current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    from ..services.ml_service import get_portfolio_analytics
    from ..services.stock_service import get_stock_price
    
    holdings = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    
    holdings_data = []
    for holding in holdings:
        stock_data = get_stock_price(holding.symbol)
        current_price = stock_data['price'] if stock_data else holding.avg_buy_price
        
        total_value = current_price * holding.quantity
        cost_basis = holding.avg_buy_price * holding.quantity
        profit_loss = total_value - cost_basis
        profit_loss_percent = (profit_loss / cost_basis) * 100 if cost_basis > 0 else 0
        
        holdings_data.append({
            "symbol": holding.symbol,
            "profit_loss_percent": profit_loss_percent
        })
    
    analytics = get_portfolio_analytics(holdings_data)
    return analytics

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 20,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.timestamp.desc()).limit(limit).all()
    
    return transactions