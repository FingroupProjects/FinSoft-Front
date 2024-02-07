import { api } from './api.js'

export default {
  login(data) {
    return  api.post('/login', data)
  },
  logout() {
    return api.get('/logout')
  }
}