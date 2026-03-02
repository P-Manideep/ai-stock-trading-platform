import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Edit2, Save, X, TrendingUp, Award, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { portfolioAPI } from '../services/api'

export default function UserProfile({ user, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState(null)
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [valueRes, transRes] = await Promise.all([
        portfolioAPI.getValue(),
        portfolioAPI.getTransactions()
      ])
      
      const totalTrades = transRes.data.length
      const buyTrades = transRes.data.filter(t => t.transaction_type === 'BUY').length
      const sellTrades = transRes.data.filter(t => t.transaction_type === 'SELL').length
      const totalVolume = transRes.data.reduce((sum, t) => sum + t.total_amount, 0)
      
      setStats({
        totalValue: valueRes.data.total_value,
        cashBalance: valueRes.data.cash_balance,
        stocksValue: valueRes.data.stocks_value,
        totalTrades,
        buyTrades,
        sellTrades,
        totalVolume
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSave = () => {
    toast.success('Profile updated!', {
      style: {
        background: '#1a1f3a',
        color: '#fff',
        border: '1px solid #10b981',
      }
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-[#1a1f3a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#2d3561]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/30 rounded-lg hover:bg-black/50 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="px-8 -mt-16">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-[#1a1f3a] flex items-center justify-center">
              <User className="w-16 h-16 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition">
              <Edit2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{user?.username}</h1>
              <p className="text-gray-400">Active Trader</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 border border-blue-500/30 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Email</span>
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium">{user?.email || 'Not provided'}</p>
              )}
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Mobile</span>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.mobile}
                  onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium">{user?.mobile || 'Not provided'}</p>
              )}
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Member Since</span>
              </div>
              <p className="text-white font-medium">
                {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Account Status</span>
              </div>
              <p className="text-green-400 font-medium">✓ Verified</p>
            </div>
          </div>

          {/* Trading Stats */}
          {stats && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Trading Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">${stats.totalValue?.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Portfolio Value</p>
                </div>

                <div className="card p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                  <p className="text-sm text-gray-400">Total Trades</p>
                </div>

                <div className="card p-4 text-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-400 font-bold">B</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.buyTrades}</p>
                  <p className="text-sm text-gray-400">Buy Orders</p>
                </div>

                <div className="card p-4 text-center">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-400 font-bold">S</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.sellTrades}</p>
                  <p className="text-sm text-gray-400">Sell Orders</p>
                </div>
              </div>

              <div className="card p-6 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 mb-1">Total Trading Volume</p>
                    <p className="text-3xl font-bold text-purple-400">${stats.totalVolume?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 mb-1">Cash Available</p>
                    <p className="text-3xl font-bold text-green-400">${stats.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}