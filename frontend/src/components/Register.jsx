import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { Loader, TrendingUp } from 'lucide-react'

export default function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.email && !formData.mobile) {
      setError('Please provide either email or mobile number')
      return
    }

    setLoading(true)

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email || null,
        mobile: formData.mobile || null,
        password: formData.password
      })
      
      setMessage('Registration successful! Logging you in...')
      
      setTimeout(async () => {
        const loginResponse = await authAPI.login({
          identifier: formData.username,
          password: formData.password
        })
        onLogin(loginResponse.data.access_token)
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center p-4">
      <motion.div 
        className="glass rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#2d3561]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-700 mt-2">Start trading with $10,000</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Mobile (Optional)</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0e27] border border-[#2d3561] rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
            />
          </div>

          {error && (
            <motion.div 
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div 
              className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {message}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}