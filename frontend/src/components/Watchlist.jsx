import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Star, X, TrendingUp, TrendingDown } from 'lucide-react'
import { watchlistAPI } from '../services/api'

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWatchlist()
    const interval = setInterval(loadWatchlist, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadWatchlist = async () => {
    try {
      const response = await watchlistAPI.get()
      setWatchlist(response.data.watchlist || [])
    } catch (error) {
      console.error('Error loading watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (id, symbol) => {
    try {
      await watchlistAPI.remove(id)
      setWatchlist(watchlist.filter(item => item.id !== id))
      toast.success(`${symbol} removed from watchlist`, {
        icon: '🗑️',
        style: { background: '#1a1f3a', color: '#fff', border: '1px solid #ef4444' }
      })
    } catch (error) {
      toast.error('Failed to remove from watchlist')
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-48 w-full rounded"></div>
      </div>
    )
  }

  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-bold">Watchlist</h2>
        <span className="text-sm text-gray-500">({watchlist.length})</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Your watchlist is empty</p>
          <p className="text-sm text-gray-600 mt-1">Click the star icon on any stock to add it</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {watchlist.map((item, idx) => (
              <motion.div
                key={item.id}
                className="bg-[#0a0e27] p-3 rounded-lg border border-[#2d3561] hover:border-blue-500/50 transition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white">{item.symbol}</p>
                      <button
                        onClick={() => removeFromWatchlist(item.id, item.symbol)}
                        className="p-1 hover:bg-red-500/20 rounded transition"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${item.price?.toFixed(2)}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      item.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}</span>
                      <span className="text-xs">({item.change_percent?.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}