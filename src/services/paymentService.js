import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

export const paymentService = {
  // Создание платежа
  createPayment: async (planId, userId, email) => {
    try {
      const response = await axios.post(`${API_URL}/payments/create`, {
        planId,
        userId,
        email
      })
      return response.data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  },

  // Проверка статуса платежа
  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await axios.get(`${API_URL}/payments/${paymentId}/status`)
      return response.data
    } catch (error) {
      console.error('Error checking payment status:', error)
      throw error
    }
  },

  // Получение информации о подписке пользователя
  getUserSubscription: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error getting user subscription:', error)
      throw error
    }
  }
}

export default paymentService 