import { useState, useEffect } from 'react'
import { portfolioAPI, stockAPI } from '../services/api'
import Portfolio from './Portfolio'
import TradingPanel from './TradingPanel'
import StockChart from './StockChart'
import Predictions from './Predictions'
import { TrendingUp, LogOut, Wallet } from 'lucide-react'

export default function Dashboard({ token, onLogout }) {
  const [portfolioValue, setPortfolioValue] = useState(null)
  const [trendingStocks, setTrendingStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [valueRes, trendingRes] = await Promise.all([
        portfolioAPI.getValue(),
        stockAPI.getTrending()
      ])
      setPortfolioValue(valueRes.data)
      setTrendingStocks(trendingRes.data.stocks || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadDashboardData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Stock Trading Simulator</h1>
            <div className="flex items-center gap-4">
              {portfolioValue && (
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Value</p>
                    <p className="text-lg font-bold text-green-600">
                      ${portfolioValue.total_value?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cash Balance */}
        {portfolioValue && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Cash Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ${portfolioValue.cash_balance?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Stocks Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${portfolioValue.stocks_value?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-green-600">
                ${portfolioValue.total_value?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <StockChart symbol={selectedStock} />
            </div>

            {/* Trading Panel */}
            <TradingPanel 
              selectedStock={selectedStock}
              onTradeComplete={refreshData}
            />

            {/* Predictions */}
            <Predictions symbol={selectedStock} />
          </div>

          {/* Right Column - Portfolio & Trending */}
          <div className="space-y-6">
            {/* Trending Stocks */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Trending Stocks</h2>
              </div>
              <div className="space-y-2">
                {trendingStocks.slice(0, 5).map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock.symbol)}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedStock === stock.symbol
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{stock.symbol}</p>
                        <p className="text-sm text-gray-600">${stock.price?.toFixed(2)}</p>
                      </div>
                      <div className={`text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <p className="font-bold">{stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}</p>
                        <p className="text-sm">{stock.change_percent?.toFixed(2)}%</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <Portfolio onRefresh={refreshData} />
          </div>
        </div>
      </div>
    </div>
  )
}