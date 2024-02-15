import { api } from './api.js'

export default {
  add(data) {
    return  api.post('/currency', data)
  },
  get() {
    return  api.get('/currency')
  },
  addRate(data, id) {
    return api.post(`/currencyRate/add/${id}`, data)
  },
  showRate(id) {
    return api.get(`/currencyRate/${id}`)
  },
  update() {

  },
  delete() {

  }
}