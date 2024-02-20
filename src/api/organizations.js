import { api } from './api.js'

export default {
  getAll(page = 1, itemPerPage = 10) {
    return  api.get('/organization', {
      params: {
        page: page,
        itemPerPage: itemPerPage
      }
    })
  },
  add() {
    return api.post('/organization')
  },
  create(data) {
    return  api.patch(`/counterparty/${id}`, data)
  },
  update() {
    return api.get('/counterparty')
  },
}