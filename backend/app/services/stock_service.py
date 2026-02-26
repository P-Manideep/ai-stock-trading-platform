import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Optional

def get_stock_price(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        history = stock.history(period="2d")
        
        if len(history) < 2:
            return None
            
        current_price = history['Close'].iloc[-1]
        prev_price = history['Close'].iloc[-2]
        change = current_price - prev_price
        change_percent = (change / prev_price) * 100
        
        return {
            "symbol": symbol.upper(),
            "price": round(float(current_price), 2),
            "change": round(float(change), 2),
            "change_percent": round(float(change_percent), 2),
            "volume": int(history['Volume'].iloc[-1]),
            "timestamp": datetime.now()
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None

def get_stock_history(symbol: str, period: str = "1mo"):
    try:
        stock = yf.Ticker(symbol)
        history = stock.history(period=period)
        return history
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return None

def search_stocks(query: str):
    popular_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "GOOGL", "name": "Alphabet Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corporation"},
        {"symbol": "AMZN", "name": "Amazon.com Inc."},
        {"symbol": "TSLA", "name": "Tesla Inc."},
        {"symbol": "META", "name": "Meta Platforms Inc."},
        {"symbol": "NVDA", "name": "NVIDIA Corporation"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
        {"symbol": "V", "name": "Visa Inc."},
        {"symbol": "WMT", "name": "Walmart Inc."}
    ]
    
    query_lower = query.lower()
    results = [s for s in popular_stocks if query_lower in s['symbol'].lower() or query_lower in s['name'].lower()]
    return results[:5]

def get_multiple_stocks(symbols: List[str]):
    results = []
    for symbol in symbols:
        data = get_stock_price(symbol)
        if data:
            results.append(data)
    return results