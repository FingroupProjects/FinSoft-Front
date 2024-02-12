import { api } from './api.js'

export default {
  addCurrency(data) {
    return  api.post('/currency', data)
  },
  getCurrency() {
    return  api.get('/currency')
  },
  addCurrencyRate(data, id) {
    return  api.post(`/currencyRate/add/${id}`, data)
  },
  showCurrencyRate(id) {
    return api.get(`/currencyRate/${id}`)
  }
}