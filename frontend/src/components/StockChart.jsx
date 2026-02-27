import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'
import { stockAPI } from '../services/api'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

export default function StockChart({ symbol }) {
  const [data, setData] = useState([])
  const [stockInfo, setStockInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('1M')

  useEffect(() => {
    loadChartData()
    const interval = setInterval(loadStockPrice, 30000)
    return () => clearInterval(interval)
  }, [symbol])

  const loadStockPrice = async () => {
    try {
      const response = await stockAPI.getPrice(symbol)
      setStockInfo(response.data)
    } catch (error) {
      console.error('Error loading price:', error)
    }
  }

  const loadChartData = async () => {
    setLoading(true)
    try {
      await loadStockPrice()
      const mockData = generateMockData(30)
      setData(mockData)
    } catch (error) {
      console.error('Error loading chart:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (days) => {
    const data = []
    let price = 150 + Math.random() * 50
    const now = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      price = price + (Math.random() - 0.5) * 10
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000)
      })
    }
    return data
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1f3a] border border-[#2d3561] rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm">{payload[0].payload.date}</p>
          <p className="text-white font-bold text-lg">${payload[0].value.toFixed(2)}</p>
          <p className="text-gray-500 text-xs">Vol: {(payload[0].payload.volume / 1000000).toFixed(2)}M</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-8 w-48 mb-4 rounded"></div>
        <div className="skeleton h-64 w-full rounded"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">{symbol}</h2>
            {stockInfo && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-white">${stockInfo.price?.toFixed(2)}</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  stockInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stockInfo.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change?.toFixed(2)} ({stockInfo.change_percent?.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#0a0e27] text-gray-400 hover:bg-[#2d3561]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="#2d3561"
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            stroke="#2d3561"
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#2d3561]">
        <div>
          <p className="text-xs text-gray-500">Open</p>
          <p className="text-sm font-semibold text-white">${stockInfo?.price?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">High</p>
          <p className="text-sm font-semibold text-green-400">${(stockInfo?.price * 1.02)?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Low</p>
          <p className="text-sm font-semibold text-red-400">${(stockInfo?.price * 0.98)?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Volume</p>
          <p className="text-sm font-semibold text-white">{(stockInfo?.volume / 1000000)?.toFixed(2)}M</p>
        </div>
      </div>
    </motion.div>
  )
}