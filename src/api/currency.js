import { api } from './api.js'

export default {
  addCurrencyRate(data) {
    return  api.post('/currencyRate', data)
  },
  addCurrency(data) {
    return  api.post('/currency', data)
  }
}