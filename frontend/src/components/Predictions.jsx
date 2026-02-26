import { useState, useEffect } from 'react'
import { predictionAPI } from '../services/api'
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Predictions({ symbol }) {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrediction()
  }, [symbol])

  const loadPrediction = async () => {
    setLoading(true)
    try {
      const response = await predictionAPI.get(symbol)
      setPrediction(response.data)
    } catch (error) {
      console.error('Error loading prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">Loading AI prediction...</p>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-500">No prediction available</p>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (prediction.trend === 'UP') return <TrendingUp className="w-6 h-6" />
    if (prediction.trend === 'DOWN') return <TrendingDown className="w-6 h-6" />
    return <Minus className="w-6 h-6" />
  }

  const getTrendColor = () => {
    if (prediction.trend === 'UP') return 'text-green-600 bg-green-50'
    if (prediction.trend === 'DOWN') return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-bold">AI Prediction for {symbol}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Price</p>
          <p className="text-2xl font-bold text-blue-600">
            ${prediction.current_price?.toFixed(2)}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Predicted Price (7d)</p>
          <p className="text-2xl font-bold text-purple-600">
            ${prediction.predicted_price?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-lg ${getTrendColor()}`}>
        <div className="flex items-center gap-3">
          {getTrendIcon()}
          <div>
            <p className="font-bold text-lg">Trend: {prediction.trend}</p>
            <p className="text-sm">AI Confidence: {prediction.confidence?.toFixed(1)}%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Expected Change</p>
          <p className="font-bold text-lg">
            {((prediction.predicted_price - prediction.current_price) / prediction.current_price * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          ⚠️ AI predictions are estimates based on historical data and should not be considered financial advice.
        </p>
      </div>
    </div>
  )
}