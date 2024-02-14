import { api } from './api.js'

export default {
  getAll(data) {
    return  api.get('/organization', data)
  },
  create(data) {
    return  api.patch(`/counterparty/${id}`, data)
  },
  update() {
    return api.get('/counterparty')
  },

}