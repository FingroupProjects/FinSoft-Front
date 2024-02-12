import { api } from './api.js'
import {getToken} from '../composables/auth'

export default {
  login(data) {
    return  api.post('/login', data)
  },
  logout() {
    return api.get('/logout', { headers: { Authorization: `Bearer ${getToken()}` } })
  }
}