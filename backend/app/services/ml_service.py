import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from .stock_service import get_stock_history

def predict_stock_price(symbol: str, days_ahead: int = 7):
    try:
        history = get_stock_history(symbol, period="3mo")
        if history is None or len(history) < 10:
            return None
        
        prices = history['Close'].values
        
        # Simple prediction using moving averages
        short_ma = np.mean(prices[-7:])
        long_ma = np.mean(prices[-30:])
        current_price = float(prices[-1])
        
        # Trend direction
        if short_ma > long_ma:
            trend = "UP"
            predicted_change = (short_ma - long_ma) / long_ma * 0.3
        else:
            trend = "DOWN"
            predicted_change = (short_ma - long_ma) / long_ma * 0.3
        
        predicted_price = current_price * (1 + predicted_change)
        
        # Confidence based on price volatility
        volatility = np.std(prices[-30:]) / np.mean(prices[-30:])
        confidence = max(50, min(95, 85 - (volatility * 100)))
        
        return {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "confidence": round(confidence, 2),
            "trend": trend,
            "prediction_date": datetime.utcnow() + timedelta(days=days_ahead)
        }
    except Exception as e:
        print(f"Prediction error for {symbol}: {e}")
        return None