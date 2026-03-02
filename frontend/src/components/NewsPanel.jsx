import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { newsAPI } from '../services/api'

export default function NewsPanel({ symbol }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (symbol) {
      loadNews()
    }
  }, [symbol])

  const loadNews = async () => {
    setLoading(true)
    try {
      const response = await newsAPI.getStockNews(symbol)
      setNews(response.data.news || [])
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentBadge = (sentiment) => {
    const badges = {
      positive: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: TrendingUp },
      negative: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: TrendingDown },
      neutral: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Minus }
    }
    const badge = badges[sentiment] || badges.neutral
    const Icon = badge.icon
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {sentiment}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-6">
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
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold">Latest News - {symbol}</h2>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-8">
          <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No news available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-[#0a0e27] p-4 rounded-lg border border-[#2d3561] hover:border-blue-500/50 transition cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => window.open(item.url, '_blank')}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-white text-sm line-clamp-2">{item.title}</h3>
                <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
              
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.source}</span>
                {getSentimentBadge(item.sentiment)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}