import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
}

export const stockAPI = {
  search: (query) => api.get(`/stocks/search?q=${query}`),
  getPrice: (symbol) => api.get(`/stocks/price/${symbol}`),
  getTrending: () => api.get('/stocks/trending'),
  getGainers: () => api.get('/stocks/gainers'),
  getLosers: () => api.get('/stocks/losers'),
}

export const portfolioAPI = {
  get: () => api.get('/portfolio'),
  getValue: () => api.get('/portfolio/value'),
  buy: (data) => api.post('/portfolio/buy', data),
  sell: (data) => api.post('/portfolio/sell', data),
  getTransactions: () => api.get('/portfolio/transactions'),
  getAnalytics: () => api.get('/portfolio/analytics'),
}

export const predictionAPI = {
  get: (symbol) => api.get(`/predictions/${symbol}`),
}

export const watchlistAPI = {
  get: () => api.get('/watchlist'),
  add: (symbol) => api.post('/watchlist/add', null, { params: { symbol } }),
  remove: (id) => api.delete(`/watchlist/${id}`),
  getAlerts: () => api.get('/watchlist/alerts'),
  createAlert: (data) => api.post('/watchlist/alerts', null, { params: data }),
  deleteAlert: (id) => api.delete(`/watchlist/alerts/${id}`)
}

export const newsAPI = {
  getStockNews: (symbol) => api.get(`/stocks/${symbol}/news`),
  getMarketNews: () => api.get('/stocks/market/news')
}

export default api