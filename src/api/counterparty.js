import { api } from './api.js'
import {getToken} from '../composables/auth'

export default {
  createCounterparty(data) {
    return  api.post('/counterparty', data)
  },
  createCounterparty(data) {
    return  api.patch(`/counterparty${id}`, data)
  },
  getCounterparty() {
    return api.get('/counterparty', { headers: { Authorization: `Bearer ${getToken()}` } })
  }
}