from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..auth import get_verified_user
from ..models import User, StockPrediction
from ..schemas import StockPredictionResponse
from ..services.ml_service import predict_stock_price

router = APIRouter()

@router.get("/{symbol}", response_model=StockPredictionResponse)
def get_prediction(symbol: str, current_user: User = Depends(get_verified_user), db: Session = Depends(get_db)):
    # Check if we have recent prediction (< 1 hour old)
    recent_prediction = db.query(StockPrediction).filter(
        StockPrediction.symbol == symbol.upper(),
        StockPrediction.created_at > datetime.utcnow() - timedelta(hours=1)
    ).first()
    
    if recent_prediction:
        return StockPredictionResponse(
            symbol=recent_prediction.symbol,
            current_price=0,  # Will be fetched separately
            predicted_price=recent_prediction.predicted_price,
            confidence=recent_prediction.confidence,
            trend=recent_prediction.trend,
            prediction_date=recent_prediction.prediction_date
        )
    
    # Generate new prediction
    prediction_data = predict_stock_price(symbol)
    
    if not prediction_data:
        raise HTTPException(status_code=404, detail="Unable to generate prediction")
    
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

@router.get("/")
def get_multiple_predictions(symbols: str, current_user: User = Depends(get_verified_user)):
    symbol_list = symbols.split(',')
    predictions = []
    
    for symbol in symbol_list[:5]:  # Limit to 5 symbols
        try:
            pred = predict_stock_price(symbol.strip())
            if pred:
                predictions.append(pred)
        except:
            continue
    
    return {"predictions": predictions}