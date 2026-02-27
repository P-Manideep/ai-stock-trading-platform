import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { predictionAPI } from '../services/api'
import { Brain, TrendingUp, TrendingDown, Minus, Activity, Zap } from 'lucide-react'

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
      <div className="card p-6">
        <div className="skeleton h-6 w-48 mb-4 rounded"></div>
        <div className="skeleton h-32 w-full rounded"></div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="card p-6">
        <p className="text-center text-gray-500">No prediction available</p>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (prediction.trend?.includes('UP')) return <TrendingUp className="w-6 h-6" />
    if (prediction.trend?.includes('DOWN')) return <TrendingDown className="w-6 h-6" />
    return <Minus className="w-6 h-6" />
  }

  const getTrendColor = () => {
    if (prediction.trend?.includes('UP')) return 'text-green-400 bg-green-500/10 border-green-500/30'
    if (prediction.trend?.includes('DOWN')) return 'text-red-400 bg-red-500/10 border-red-500/30'
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }

  const getSignalColor = (rec) => {
    if (rec?.includes('BUY')) return 'bg-green-500/20 text-green-400 border-green-500/40'
    if (rec?.includes('SELL')) return 'bg-red-500/20 text-red-400 border-red-500/40'
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
  }

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold">AI Analysis for {symbol}</h2>
      </div>

      {/* Price Prediction */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <p className="text-sm text-gray-400 mb-1">Current Price</p>
          <p className="text-2xl font-bold text-blue-400">
            ${prediction.current_price?.toFixed(2)}
          </p>
        </div>

        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
          <p className="text-sm text-gray-400 mb-1">7-Day Prediction</p>
          <p className="text-2xl font-bold text-purple-400">
            ${prediction.predicted_price?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trend & Signal */}
      <div className={`flex items-center justify-between p-4 rounded-lg border mb-4 ${getTrendColor()}`}>
        <div className="flex items-center gap-3">
          {getTrendIcon()}
          <div>
            <p className="font-bold text-lg">{prediction.trend}</p>
            <p className="text-sm opacity-80">AI Confidence: {prediction.confidence?.toFixed(1)}%</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Expected Change</p>
          <p className="font-bold text-lg">
            {((prediction.predicted_price - prediction.current_price) / prediction.current_price * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Trading Signal */}
      {prediction.signal && (
        <div className={`p-4 rounded-lg border ${getSignalColor(prediction.signal.recommendation)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-bold text-lg">{prediction.signal.recommendation}</span>
            </div>
            <span className="badge badge-info">{prediction.signal.confidence}% Confidence</span>
          </div>
          
          {prediction.signal.signals && prediction.signal.signals.length > 0 && (
            <div className="space-y-1">
              {prediction.signal.signals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm opacity-90">
                  <span className="text-blue-400">•</span>
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technical Indicators */}
      {prediction.technical_indicators && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-[#0a0e27] p-3 rounded-lg border border-[#2d3561]">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">RSI</p>
            </div>
            <p className="text-lg font-bold text-white">
              {prediction.technical_indicators.rsi?.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">
              {prediction.technical_indicators.rsi < 30 ? 'Oversold' : 
               prediction.technical_indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
            </p>
          </div>

          {prediction.technical_indicators.macd && (
            <div className="bg-[#0a0e27] p-3 rounded-lg border border-[#2d3561]">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">MACD</p>
              </div>
              <p className="text-lg font-bold text-white">
                {prediction.technical_indicators.macd.macd?.toFixed(2)}
              </p>
              <p className={`text-xs ${prediction.technical_indicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {prediction.technical_indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
              </p>
            </div>
          )}

          {prediction.technical_indicators.bollinger_bands && (
            <div className="bg-[#0a0e27] p-3 rounded-lg border border-[#2d3561]">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-400">BB</p>
              </div>
              <p className="text-lg font-bold text-white">
                ${prediction.technical_indicators.bollinger_bands.middle?.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Middle Band</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-400">
          ⚠️ AI predictions are for educational purposes only. Not financial advice.
        </p>
      </div>
    </motion.div>
  )
}