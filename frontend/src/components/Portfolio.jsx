import { useState, useEffect } from 'react'
import { portfolioAPI } from '../services/api'
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react'

export default function Portfolio({ onRefresh }) {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.get()
      setHoldings(response.data)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [onRefresh])

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Loading portfolio...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-bold">My Portfolio</h2>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No holdings yet</p>
          <p className="text-sm text-gray-400 mt-2">Start trading to build your portfolio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-lg">{holding.symbol}</p>
                  <p className="text-sm text-gray-600">{holding.quantity} shares</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${holding.current_price?.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Avg: ${holding.avg_buy_price?.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-bold">${holding.total_value?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">P/L</p>
                  <div className={`flex items-center gap-1 font-bold ${
                    holding.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {holding.profit_loss >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>${Math.abs(holding.profit_loss)?.toFixed(2)}</span>
                    <span className="text-sm">({holding.profit_loss_percent?.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}