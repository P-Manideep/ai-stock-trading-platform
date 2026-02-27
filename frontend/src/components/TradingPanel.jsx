import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { stockAPI, portfolioAPI } from '../services/api'
import { ShoppingCart, DollarSign, Loader } from 'lucide-react'

export default function TradingPanel({ selectedStock, onTradeComplete }) {
  const [action, setAction] = useState('buy')
  const [quantity, setQuantity] = useState(1)
  const [stockPrice, setStockPrice] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStockPrice()
  }, [selectedStock])

  const loadStockPrice = async () => {
    try {
      const response = await stockAPI.getPrice(selectedStock)
      setStockPrice(response.data)
    } catch (error) {
      console.error('Error loading price:', error)
    }
  }

  const handleTrade = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tradeData = { symbol: selectedStock, quantity: parseInt(quantity) }
      const response = action === 'buy' 
        ? await portfolioAPI.buy(tradeData)
        : await portfolioAPI.sell(tradeData)
      
      toast.success(response.data.message, {
        icon: action === 'buy' ? '📈' : '📉',
        style: {
          background: '#1a1f3a',
          color: '#fff',
          border: '1px solid #2d3561',
        }
      })
      
      setQuantity(1)
      onTradeComplete()
      loadStockPrice()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Trade failed', {
        icon: '❌',
        style: {
          background: '#1a1f3a',
          color: '#fff',
          border: '1px solid #ef4444',
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const totalCost = stockPrice ? (stockPrice.price * quantity).toFixed(2) : '0.00'

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold mb-4">Trade {selectedStock}</h2>

      {stockPrice && (
        <motion.div 
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg mb-4 border border-blue-500/30"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-3xl font-bold text-white">${stockPrice.price?.toFixed(2)}</p>
            </div>
            <div className={`text-right ${stockPrice.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <p className="font-bold text-lg">{stockPrice.change >= 0 ? '+' : ''}{stockPrice.change?.toFixed(2)}</p>
              <p className="text-sm">{stockPrice.change_percent?.toFixed(2)}%</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAction('buy')}
          className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            action === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
              : 'bg-[#0a0e27] text-gray-400 hover:bg-[#2d3561] border border-[#2d3561]'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          Buy
        </button>
        <button
          onClick={() => setAction('sell')}
          className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            action === 'sell'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
              : 'bg-[#0a0e27] text-gray-400 hover:bg-[#2d3561] border border-[#2d3561]'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          Sell
        </button>
      </div>

      <form onSubmit={handleTrade} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-[#0a0e27] p-4 rounded-lg border border-[#2d3561]">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total {action === 'buy' ? 'Cost' : 'Value'}:</span>
            <span className="font-bold text-2xl text-white">${totalCost}</span>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-white transition shadow-lg ${
            action === 'buy'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `${action === 'buy' ? 'Buy' : 'Sell'} ${selectedStock}`
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}