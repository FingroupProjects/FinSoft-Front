import { api, buildParams } from './api.js'

export default {
  getAll({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/organization', { params })
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