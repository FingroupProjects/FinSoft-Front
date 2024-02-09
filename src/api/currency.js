import { api } from './api.js'

export default {
  addCurrencyRate(data, id) {
    return  api.post(`/currencyRate/add/${id}`, data)
  },
  addCurrency(data) {
    return  api.post('/currency', data)
  }
}