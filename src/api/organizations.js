import { api } from './api.js'

export default {
  getAll(page = 1, itemsPerPage = 10) {
    return api.get('/organization', {
      params: {
        page: page,
        itemsPerPage: itemsPerPage
      }
    })
  },  
  add(data) {
    return api.post('/organization', data)
  },
  create(data) {
    return  api.patch(`/counterparty/${id}`, data)
  },
  update() {
    return api.get('/counterparty')
  },
}