# 🚀 AI-Powered Stock Trading Platform

> A full-stack production-grade trading simulator with real-time data, ML predictions, and comprehensive portfolio management

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [ML Prediction Engine](#-ml-prediction-engine)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🎯 Overview

A sophisticated stock trading simulator combining real-time market data, machine learning predictions, and modern web technologies. Built with scalability, performance, and user experience as core principles.

### What Makes This Different?

- **Real API Integration**: Live stock data from Yahoo Finance
- **ML-Powered Predictions**: Technical analysis using RSI, MACD, Bollinger Bands
- **Production Architecture**: Service-layer pattern, modular design, RESTful APIs
- **Performance Optimized**: Lazy loading, rate limiting, efficient rendering
- **Professional UI**: Dark mode, responsive design, smooth animations

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- OTP verification system
- Password hashing with bcrypt
- Role-based access control (User/Admin)

### 📊 Portfolio Management
- Real-time portfolio value tracking
- Buy/Sell stock simulation
- Transaction history
- Portfolio analytics (Sharpe ratio, P/L, volatility)

### 📈 Stock Market Features
- **100+ Stocks**: US (NASDAQ, NYSE) and Indian markets (NSE)
- Live price updates with change indicators
- Interactive charts with multiple timeframes
- Market movers: Top gainers and losers

### 🤖 AI Prediction Engine
- Technical indicators: RSI, MACD, Bollinger Bands
- Buy/Sell signals with 75-95% confidence
- 7-day price predictions with trend analysis

### ⭐ Additional Features
- Watchlist & price alerts
- Stock news integration
- User profile with trading statistics
- Admin dashboard for platform monitoring

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **Python 3.11+** - Core backend language
- **SQLAlchemy** - ORM for database operations
- **yfinance** - Real-time stock market data
- **pandas & NumPy** - Data analysis and ML
- **JWT** - Secure authentication

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive charts
- **Axios** - HTTP client
- **Framer Motion** - Smooth animations

---

## 🏗 Architecture

```
Client (React) 
    ↓ HTTP/REST
FastAPI Backend
    ↓
Route Layer → Service Layer → Database Layer
    ↓              ↓               ↓
  Routes       Business Logic   SQLAlchemy ORM
                                    ↓
                              SQLite Database
```

**Design Patterns**: Service Layer, Repository Pattern, Dependency Injection, RESTful API

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Installation

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
uvicorn app.main:app --reload
```
**Backend**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Frontend**: http://localhost:5173

---

## 📚 API Documentation

### Core Endpoints
```
Authentication
POST   /auth/register        - Register new user
POST   /auth/login           - Login and get JWT token

Stocks
GET    /stocks/price/{symbol} - Get current price
GET    /stocks/trending       - Get trending stocks
GET    /stocks/gainers        - Top gainers
GET    /stocks/losers         - Top losers

Portfolio
GET    /portfolio             - Get portfolio
POST   /portfolio/buy         - Buy stocks
POST   /portfolio/sell        - Sell stocks
GET    /portfolio/analytics   - Portfolio metrics

Predictions
GET    /predictions/{symbol}  - AI prediction

Watchlist
GET    /watchlist             - Get watchlist
POST   /watchlist/add         - Add stock

Admin
GET    /admin/stats           - Platform statistics
GET    /admin/users           - All users
```

**Full docs**: http://localhost:8000/docs

---

## 🤖 ML Prediction Engine

### Technical Indicators

**RSI** (14-period) - Momentum indicator  
**MACD** (12,26,9) - Trend indicator  
**Bollinger Bands** (20-period, 2σ) - Volatility indicator

### Signal Generation
```
Score Calculation:
- RSI < 30:  +2 (Oversold)
- RSI > 70:  -2 (Overbought)
- MACD > 0:  +1 (Bullish)
- MACD < 0:  -1 (Bearish)
- Price < BB Lower: +1
- Price > BB Upper: -1

Signal Output:
- Score ≥3:  STRONG BUY (90%)
- Score ≥1:  BUY (75%)
- Score ≤-3: STRONG SELL (90%)
- Score ≤-1: SELL (75%)
- Else:      HOLD (60%)
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── models.py        # Database models
│   ├── auth.py          # JWT authentication
│   └── main.py          # FastAPI app

frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API client
│   └── App.jsx          # Router setup
```

---

## 🗺 Roadmap

### ✅ Completed
- [x] Authentication & JWT
- [x] Real-time stock data
- [x] Portfolio management
- [x] ML predictions
- [x] Watchlist & alerts
- [x] Admin dashboard

### 📅 Planned
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] WebSocket real-time updates
- [ ] Advanced ML models (LSTM)
- [ ] Cloud deployment
- [ ] Mobile app

---

## 👨‍💻 Author

**Manideep Pothkan**  
Full-Stack Developer | DevOps Engineer

[![GitHub](https://img.shields.io/badge/GitHub-P--Manideep-181717?logo=github)](https://github.com/P-Manideep)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?logo=linkedin)](https://linkedin.com/in/manideep-pothkan)

---

## ⭐ Support

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">
  <sub>Built with ❤️ by Manideep Pothkan</sub>
</div>
