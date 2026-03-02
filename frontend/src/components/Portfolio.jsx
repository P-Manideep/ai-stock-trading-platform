import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { portfolioAPI } from '../services/api'
import { Briefcase, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function Portfolio({ onRefresh }) {
  const [holdings, setHoldings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  useEffect(() => {
    loadPortfolio()
  }, [onRefresh])

  const loadPortfolio = async () => {
    try {
      const [holdingsRes, analyticsRes] = await Promise.all([
        portfolioAPI.get(),
        portfolioAPI.getAnalytics().catch(() => null)
      ])
      setHoldings(holdingsRes.data)
      if (analyticsRes) setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6 bg-[#1a1f3a]">
        <div className="skeleton h-6 w-32 mb-4 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-20 w-full rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="card p-6 bg-[#1a1f3a]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">My Portfolio</h2>
      </div>

      {/* Analytics Summary */}
      {analytics && analytics.total_stocks > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Avg Return</p>
              <p className={`text-lg font-bold ${analytics.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analytics.total_return >= 0 ? '+' : ''}{analytics.total_return?.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Volatility</p>
              <p className="text-lg font-bold text-yellow-400">
                {analytics.volatility?.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Best Stock</p>
              <p className="text-lg font-bold text-green-400">
                +{analytics.best_performer?.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Worst Stock</p>
              <p className="text-lg font-bold text-red-400">
                {analytics.worst_performer?.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {holdings.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No holdings yet</p>
          <p className="text-sm text-gray-600 mt-2">Start trading to build your portfolio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map((holding, idx) => (
            <motion.div 
              key={holding.symbol} 
              className="p-4 bg-[#0a0e27] rounded-lg border border-[#2d3561] hover:border-blue-500/50 transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg text-white">{holding.symbol}</p>
                  <p className="text-sm text-gray-400">{holding.quantity} shares</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${holding.current_price?.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Avg: ${holding.avg_buy_price?.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-[#2d3561]">
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="font-bold text-white">${holding.total_value?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">P/L</p>
                  <div className={`flex items-center gap-1 font-bold ${
                    holding.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {holding.profit_loss >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>${Math.abs(holding.profit_loss)?.toFixed(2)}</span>
                    <span className="text-xs">({holding.profit_loss_percent?.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}