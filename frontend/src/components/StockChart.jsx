import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { stockAPI } from '../services/api'
import { Activity } from 'lucide-react'

export default function StockChart({ symbol }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [symbol])

  const loadChartData = async () => {
    try {
      // Generate mock historical data (in production, fetch real data)
      const mockData = generateMockData()
      setData(mockData)
    } catch (error) {
      console.error('Error loading chart:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const data = []
    let price = 150 + Math.random() * 50
    const now = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      price = price + (Math.random() - 0.5) * 10
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(price.toFixed(2))
      })
    }
    return data
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">{symbol} Price Chart</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#666"
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
            formatter={(value) => [`$${value}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}