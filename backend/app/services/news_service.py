# app/services/news_service.py

import requests
from datetime import datetime
import os

NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'demo')

def get_stock_news(symbol: str, limit: int = 5):
    """Get news for a stock"""
    # Mock news for now (you can add NewsAPI later)
    mock_news = [
        {
            "title": f"{symbol} Reports Strong Q4 Earnings",
            "description": "Company beats analyst expectations",
            "source": "Financial Times",
            "url": "https://example.com",
            "published_at": datetime.now().isoformat(),
            "sentiment": "positive"
        },
        {
            "title": f"Analysts Upgrade {symbol} to Buy",
            "description": "Multiple firms raise price targets",
            "source": "Bloomberg",
            "url": "https://example.com",
            "published_at": datetime.now().isoformat(),
            "sentiment": "positive"
        },
        {
            "title": f"{symbol} Announces New Product Launch",
            "description": "Innovation drives market excitement",
            "source": "Reuters",
            "url": "https://example.com",
            "published_at": datetime.now().isoformat(),
            "sentiment": "neutral"
        }
    ]
    return mock_news[:limit]

def get_market_news(limit: int = 10):
    """Get general market news"""
    mock_news = [
        {
            "title": "Markets Rally on Fed Decision",
            "description": "Stocks surge after interest rate announcement",
            "source": "CNBC",
            "url": "https://example.com",
            "published_at": datetime.now().isoformat(),
            "sentiment": "positive"
        },
        {
            "title": "Tech Sector Leads Market Gains",
            "description": "Technology stocks outperform broader market",
            "source": "Wall Street Journal",
            "url": "https://example.com",
            "published_at": datetime.now().isoformat(),
            "sentiment": "positive"
        }
    ]
    return mock_news[:limit]
