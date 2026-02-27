import { useState, useEffect, lazy, Suspense, memo } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { portfolioAPI, stockAPI } from '../services/api'
import { TrendingUp, LogOut, Wallet, Activity, BarChart3 } from 'lucide-react'

// Lazy load heavy components
const Portfolio = lazy(() => import('./Portfolio'))
const TradingPanel = lazy(() => import('./TradingPanel'))
const StockChart = lazy(() => import('./StockChart'))
const Predictions = lazy(() => import('./Predictions'))

// Loading skeleton component
const LoadingSkeleton = ({ height = "h-64" }) => (
  <div className="card p-6">
    <div className={`skeleton ${height} w-full rounded`}></div>
  </div>
)

// Memoized trending stock button
const TrendingStockButton = memo(({ stock, isSelected, onSelect, index }) => (
  <motion.button
    onClick={() => onSelect(stock.symbol)}
    className={`w-full p-3 rounded-lg text-left transition ${
      isSelected
        ? 'bg-blue-500/20 border-2 border-blue-500'
        : 'bg-[#0a0e27] hover:bg-[#2d3561] border border-[#2d3561]'
    }`}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="font-bold text-white">{stock.symbol}</p>
        <p className="text-sm text-gray-400">${stock.price?.toFixed(2)}</p>
      </div>
      <div className={`text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        <p className="font-bold">{stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}</p>
        <p className="text-sm">{stock.change_percent?.toFixed(2)}%</p>
      </div>
    </div>
  </motion.button>
))

export default function Dashboard({ token, onLogout }) {
  const [portfolioValue, setPortfolioValue] = useState(null)
  const [trendingStocks, setTrendingStocks] = useState([])
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadDashboardData()
    // Reduced refresh rate to 60 seconds for better performance
    const interval = setInterval(loadDashboardData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [valueRes, trendingRes, analyticsRes] = await Promise.all([
        portfolioAPI.getValue(),
        stockAPI.getTrending(),
        portfolioAPI.getAnalytics().catch(() => null)
      ])
      setPortfolioValue(valueRes.data)
      setTrendingStocks(trendingRes.data.stocks || [])
      if (analyticsRes) setAnalytics(analyticsRes.data)
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
    <div className="min-h-screen bg-[#0a0e27]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <nav className="bg-[#1a1f3a] border-b border-[#2d3561] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI Stock Trading Platform
            </h1>
            <div className="flex items-center gap-4">
              {portfolioValue && (
                <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
                  <Wallet className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-green-400">
                      ${portfolioValue.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/30 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {portfolioValue && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Cash Balance</p>
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">
                ${portfolioValue.cash_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Stocks Value</p>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-400">
                ${portfolioValue.stocks_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Total Assets</p>
                <BarChart3 className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">
                ${portfolioValue.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            {analytics && (
              <motion.div 
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Sharpe Ratio</p>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {analytics.sharpe_ratio?.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Risk-adjusted return</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<LoadingSkeleton height="h-80" />}>
              <StockChart symbol={selectedStock} />
            </Suspense>
            
            <Suspense fallback={<LoadingSkeleton height="h-64" />}>
              <TradingPanel selectedStock={selectedStock} onTradeComplete={refreshData} />
            </Suspense>
            
            <Suspense fallback={<LoadingSkeleton height="h-64" />}>
              <Predictions symbol={selectedStock} />
            </Suspense>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Trending Stocks */}
            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold">Trending Stocks</h2>
              </div>
              <div className="space-y-2">
                {trendingStocks.slice(0, 8).map((stock, idx) => (
                  <TrendingStockButton
                    key={stock.symbol}
                    stock={stock}
                    isSelected={selectedStock === stock.symbol}
                    onSelect={setSelectedStock}
                    index={idx}
                  />
                ))}
              </div>
            </motion.div>

            {/* Portfolio */}
            <Suspense fallback={<LoadingSkeleton height="h-96" />}>
              <Portfolio onRefresh={refreshData} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}