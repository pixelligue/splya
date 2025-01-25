import axios from 'axios'
import crypto from 'crypto'

const TINKOFF_API_URL = process.env.REACT_APP_TINKOFF_API_URL || 'https://securepay.tinkoff.ru/v2'
const TERMINAL_KEY = process.env.REACT_APP_TINKOFF_TERMINAL_KEY
const SECRET_KEY = process.env.REACT_APP_TINKOFF_SECRET_KEY

const generateToken = (data) => {
  const values = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, value]) => value)
    .join('')

  return crypto
    .createHash('sha256')
    .update(values)
    .digest('hex')
}

export const tinkoffService = {
  // Инициализация платежа
  initPayment: async (orderId, amount, description, email, successURL) => {
    try {
      const data = {
        TerminalKey: TERMINAL_KEY,
        Amount: amount * 100, // Сумма в копейках
        OrderId: orderId,
        Description: description,
        DATA: {
          Email: email,
        },
        NotificationURL: `${window.location.origin}/api/payments/webhook`,
        SuccessURL: successURL || `${window.location.origin}/dashboard/subscriptions`,
        PayType: 'T', // Одностадийная оплата
        Receipt: {
          Email: email,
          Taxation: 'usn_income', // Упрощенная СН (доходы)
          Items: [
            {
              Name: description,
              Price: amount * 100, // Сумма в копейках
              Quantity: 1.00,
              Amount: amount * 100,
              PaymentMethod: 'full_prepayment',
              PaymentObject: 'service',
              Tax: 'none'
            }
          ]
        }
      }

      // Добавляем токен
      data.Token = generateToken(data)

      const response = await axios.post(`${TINKOFF_API_URL}/Init`, data)
      return response.data
    } catch (error) {
      console.error('Error initializing payment:', error)
      throw error
    }
  },

  // Проверка статуса платежа
  checkPaymentStatus: async (paymentId) => {
    try {
      const data = {
        TerminalKey: TERMINAL_KEY,
        PaymentId: paymentId
      }
      
      // Добавляем токен
      data.Token = generateToken(data)

      const response = await axios.post(`${TINKOFF_API_URL}/GetState`, data)
      return response.data
    } catch (error) {
      console.error('Error checking payment status:', error)
      throw error
    }
  },

  // Отмена платежа
  cancelPayment: async (paymentId) => {
    try {
      const data = {
        TerminalKey: TERMINAL_KEY,
        PaymentId: paymentId
      }
      
      // Добавляем токен
      data.Token = generateToken(data)

      const response = await axios.post(`${TINKOFF_API_URL}/Cancel`, data)
      return response.data
    } catch (error) {
      console.error('Error canceling payment:', error)
      throw error
    }
  },

  // Сохранение карты для рекуррентных платежей
  initRecurrent: async (orderId, amount, description, email, rebillId) => {
    try {
      const data = {
        TerminalKey: TERMINAL_KEY,
        Amount: amount * 100,
        OrderId: orderId,
        Description: description,
        DATA: {
          Email: email,
        },
        NotificationURL: `${window.location.origin}/api/payments/webhook`,
        SuccessURL: `${window.location.origin}/dashboard/subscriptions`,
        PayType: 'T',
        Recurrent: 'Y', // Признак рекуррентного платежа
        CustomerKey: email, // Идентификатор покупателя
        Receipt: {
          Email: email,
          Taxation: 'usn_income',
          Items: [
            {
              Name: description,
              Price: amount * 100,
              Quantity: 1.00,
              Amount: amount * 100,
              PaymentMethod: 'full_prepayment',
              PaymentObject: 'service',
              Tax: 'none'
            }
          ]
        }
      }

      if (rebillId) {
        data.RebillId = rebillId
      }

      // Добавляем токен
      data.Token = generateToken(data)

      const response = await axios.post(`${TINKOFF_API_URL}/Init`, data)
      return response.data
    } catch (error) {
      console.error('Error initializing recurrent payment:', error)
      throw error
    }
  }
}

export default tinkoffService 