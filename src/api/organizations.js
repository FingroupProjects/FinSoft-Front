import { api } from './api.js'
import {getToken} from '../composables/auth'

export default {
  index(data) {
    return  api.get('/organization', data)
  },
  create(data) {
    return  api.patch(`/counterparty${id}`, data)
  },
  update() {
    return api.get('/counterparty', { headers: { Authorization: `Bearer ${getToken()}` } })
  },

}