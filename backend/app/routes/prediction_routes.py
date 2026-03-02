from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..auth import get_verified_user
from ..models import User, StockPrediction
from ..services.ml_service import predict_stock_price

router = APIRouter()

@router.get("/{symbol}")
def get_prediction(symbol: str, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    """Get AI prediction for a stock"""
    
    # Check for recent prediction (within 1 hour)
    recent = db.query(StockPrediction).filter(
        StockPrediction.symbol == symbol.upper(),
        StockPrediction.created_at > datetime.utcnow() - timedelta(hours=1)
    ).first()
    
    if recent:
        return {
            "symbol": recent.symbol,
            "current_price": 0,
            "predicted_price": recent.predicted_price,
            "confidence": recent.confidence,
            "trend": recent.trend,
            "prediction_date": recent.prediction_date,
            "technical_indicators": None,
            "signal": None
        }
    
    # Generate new prediction
    try:
        prediction_data = predict_stock_price(symbol)
        
        if not prediction_data:
            raise HTTPException(status_code=404, detail=f"Unable to generate prediction for {symbol}")
        
        # Save to database
        db_prediction = StockPrediction(
            symbol=symbol.upper(),
            prediction_date=prediction_data['prediction_date'],
            predicted_price=prediction_data['predicted_price'],
            confidence=prediction_data['confidence'],
            trend=prediction_data['trend']
        )
        db.add(db_prediction)
        db.commit()
        
        return prediction_data
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")

@router.get("/")
def get_multiple_predictions(symbols: str, current_user: User = Depends(get_verified_user)):
    """Get predictions for multiple stocks"""
    symbol_list = symbols.split(',')
    predictions = []
    
    for symbol in symbol_list[:5]:
        try:
            pred = predict_stock_price(symbol.strip())
            if pred:
                predictions.append(pred)
        except:
            continue
    
    return {"predictions": predictions}