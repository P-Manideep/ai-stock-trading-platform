import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from .stock_service import get_stock_history

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index"""
    if len(prices) < period + 1:
        return 50
    
    deltas = np.diff(prices)
    gain = np.where(deltas > 0, deltas, 0)
    loss = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gain[-period:])
    avg_loss = np.mean(loss[-period:])
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return round(rsi, 2)

def calculate_macd(prices):
    """Calculate MACD"""
    if len(prices) < 26:
        return {"macd": 0, "signal": 0, "histogram": 0}
    
    exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
    exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    histogram = macd - signal
    
    return {
        "macd": round(float(macd.iloc[-1]), 2),
        "signal": round(float(signal.iloc[-1]), 2),
        "histogram": round(float(histogram.iloc[-1]), 2)
    }

def calculate_bollinger_bands(prices, period=20):
    """Calculate Bollinger Bands"""
    if len(prices) < period:
        period = len(prices)
    
    sma = np.mean(prices[-period:])
    std = np.std(prices[-period:])
    
    upper = sma + (2 * std)
    lower = sma - (2 * std)
    current = prices[-1]
    
    return {
        "upper": round(upper, 2),
        "middle": round(sma, 2),
        "lower": round(lower, 2),
        "current": round(current, 2)
    }

def get_buy_sell_signal(rsi, macd_data, bb_data, current_price):
    """Generate trading signal"""
    signals = []
    score = 0
    
    if rsi < 30:
        signals.append("RSI oversold - Bullish signal")
        score += 2
    elif rsi > 70:
        signals.append("RSI overbought - Bearish signal")
        score -= 2
    elif rsi < 40:
        signals.append("RSI low - Potential buy")
        score += 1
    elif rsi > 60:
        signals.append("RSI high - Potential sell")
        score -= 1
    
    if macd_data['histogram'] > 0:
        signals.append("MACD positive momentum")
        score += 1
    else:
        signals.append("MACD negative momentum")
        score -= 1
    
    if current_price < bb_data['lower']:
        signals.append("Price below lower band - Oversold")
        score += 1
    elif current_price > bb_data['upper']:
        signals.append("Price above upper band - Overbought")
        score -= 1
    
    if score >= 3:
        recommendation = "STRONG BUY"
        confidence = 90
    elif score >= 1:
        recommendation = "BUY"
        confidence = 75
    elif score <= -3:
        recommendation = "STRONG SELL"
        confidence = 90
    elif score <= -1:
        recommendation = "SELL"
        confidence = 75
    else:
        recommendation = "HOLD"
        confidence = 60
    
    return {
        "recommendation": recommendation,
        "confidence": confidence,
        "signals": signals,
        "score": score
    }

def predict_stock_price(symbol: str, days_ahead: int = 7):
    """Enhanced prediction with technical analysis"""
    try:
        history = get_stock_history(symbol, period="3mo")
        
        if history is None or len(history) < 30:
            return None
        
        prices = history['Close'].values
        current_price = float(prices[-1])
        
        rsi = calculate_rsi(prices)
        macd = calculate_macd(prices)
        bb = calculate_bollinger_bands(prices)
        
        ma_7 = np.mean(prices[-7:])
        ma_21 = np.mean(prices[-21:])
        ma_50 = np.mean(prices[-50:]) if len(prices) >= 50 else np.mean(prices)
        
        if ma_7 > ma_21 > ma_50:
            trend = "STRONG UPTREND"
            multiplier = 1.05
        elif ma_7 > ma_21:
            trend = "UPTREND"
            multiplier = 1.02
        elif ma_7 < ma_21 < ma_50:
            trend = "STRONG DOWNTREND"
            multiplier = 0.95
        elif ma_7 < ma_21:
            trend = "DOWNTREND"
            multiplier = 0.98
        else:
            trend = "SIDEWAYS"
            multiplier = 1.0
        
        momentum = (prices[-1] - prices[-7]) / prices[-7]
        predicted_price = current_price * multiplier * (1 + momentum * 0.3)
        
        volatility = np.std(prices[-30:]) / np.mean(prices[-30:])
        confidence = max(50, min(95, 75 - (volatility * 100)))
        
        signal = get_buy_sell_signal(rsi, macd, bb, current_price)
        
        return {
            "symbol": symbol.upper(),
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "confidence": round(confidence, 2),
            "trend": trend,
            "prediction_date": datetime.utcnow() + timedelta(days=days_ahead),
            "technical_indicators": {
                "rsi": rsi,
                "macd": macd,
                "bollinger_bands": bb
            },
            "signal": signal
        }
        
    except Exception as e:
        print(f"Prediction error for {symbol}: {e}")
        return None

def get_portfolio_analytics(holdings_data):
    """Calculate portfolio metrics"""
    if not holdings_data or len(holdings_data) == 0:
        return {
            "total_return": 0,
            "volatility": 0,
            "sharpe_ratio": 0,
            "best_performer": 0,
            "worst_performer": 0,
            "total_stocks": 0
        }
    
    returns = []
    for holding in holdings_data:
        if holding.get('profit_loss_percent'):
            returns.append(holding['profit_loss_percent'])
    
    if not returns:
        return {
            "total_return": 0,
            "volatility": 0,
            "sharpe_ratio": 0,
            "best_performer": 0,
            "worst_performer": 0,
            "total_stocks": len(holdings_data)
        }
    
    avg_return = np.mean(returns)
    volatility = np.std(returns) if len(returns) > 1 else 0
    
    risk_free_rate = 2.0
    sharpe = (avg_return - risk_free_rate) / volatility if volatility > 0 else 0
    
    return {
        "total_return": round(avg_return, 2),
        "volatility": round(volatility, 2),
        "sharpe_ratio": round(sharpe, 2),
        "best_performer": round(max(returns), 2),
        "worst_performer": round(min(returns), 2),
        "total_stocks": len(holdings_data)
    }