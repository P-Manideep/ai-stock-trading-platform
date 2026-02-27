from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth_routes, stock_routes, portfolio_routes, prediction_routes, admin_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stock Trading Simulator API",
    description="Real-time stock trading with AI predictions",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(stock_routes.router, prefix="/stocks", tags=["Stocks"])
app.include_router(portfolio_routes.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(prediction_routes.router, prefix="/predictions", tags=["Predictions"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])

@app.get("/")
def root():
    return {
        "message": "Stock Trading Simulator API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024"}