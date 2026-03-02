import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { stockAPI } from '../services/api'

export default function MarketMovers() {
  const [activeTab, setActiveTab] = useState('gainers')
  const [gainers, setGainers] = useState([])
  const [losers, setLosers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Note: These endpoints need to be added to backend
      const [gainersRes, losersRes] = await Promise.all([
        stockAPI.getGainers?.() || Promise.resolve({ data: { stocks: [] } }),
        stockAPI.getLosers?.() || Promise.resolve({ data: { stocks: [] } })
      ])
      setGainers(gainersRes.data.stocks || [])
      setLosers(losersRes.data.stocks || [])
    } catch (error) {
      console.error('Error loading market movers:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentStocks = activeTab === 'gainers' ? gainers : losers

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActiveTab('gainers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'gainers'
              ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
              : 'bg-[#0a0e27] text-gray-400 hover:bg-[#2d3561] border border-[#2d3561]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Top Gainers
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'losers'
              ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
              : 'bg-[#0a0e27] text-gray-400 hover:bg-[#2d3561] border border-[#2d3561]'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Top Losers
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-16 w-full rounded"></div>
          ))}
        </div>
      ) : currentStocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      ) : (
        <div className="space-y-2">
          {currentStocks.slice(0, 10).map((stock, idx) => (
            <motion.div
              key={stock.symbol}
              className="bg-[#0a0e27] p-3 rounded-lg border border-[#2d3561] hover:border-blue-500/50 transition"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{stock.symbol}</p>
                  <p className="text-xs text-gray-500">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${stock.price?.toFixed(2)}</p>
                  <p className={`text-sm font-semibold ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}