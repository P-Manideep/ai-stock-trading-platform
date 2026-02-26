import { useState, useEffect } from 'react'
import { stockAPI, portfolioAPI } from '../services/api'
import { ShoppingCart, DollarSign } from 'lucide-react'

export default function TradingPanel({ selectedStock, onTradeComplete }) {
  const [action, setAction] = useState('buy')
  const [quantity, setQuantity] = useState(1)
  const [stockPrice, setStockPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
    setMessage('')
    setError('')

    try {
      const tradeData = { symbol: selectedStock, quantity: parseInt(quantity) }
      const response = action === 'buy' 
        ? await portfolioAPI.buy(tradeData)
        : await portfolioAPI.sell(tradeData)
      
      setMessage(response.data.message)
      setQuantity(1)
      onTradeComplete()
      loadStockPrice()
    } catch (err) {
      setError(err.response?.data?.detail || 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  const totalCost = stockPrice ? (stockPrice.price * quantity).toFixed(2) : '0.00'

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Trade {selectedStock}</h2>

      {stockPrice && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl font-bold text-blue-600">${stockPrice.price?.toFixed(2)}</p>
            </div>
            <div className={`text-right ${stockPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <p className="font-bold">{stockPrice.change >= 0 ? '+' : ''}{stockPrice.change?.toFixed(2)}</p>
              <p className="text-sm">{stockPrice.change_percent?.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAction('buy')}
          className={`flex-1 py-2 rounded-lg font-medium ${
            action === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          Buy
        </button>
        <button
          onClick={() => setAction('sell')}
          className={`flex-1 py-2 rounded-lg font-medium ${
            action === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-5 h-5 inline mr-2" />
          Sell
        </button>
      </div>

      <form onSubmit={handleTrade} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Cost:</span>
            <span className="font-bold text-lg">${totalCost}</span>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white ${
            action === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } disabled:bg-gray-400`}
        >
          {loading ? 'Processing...' : `${action === 'buy' ? 'Buy' : 'Sell'} ${selectedStock}`}
        </button>
      </form>
    </div>
  )
}