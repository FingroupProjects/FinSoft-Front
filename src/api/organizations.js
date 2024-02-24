import { api, buildParams } from './api.js'

export default {
  getAll({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/organization', { params })
  },
  add(data) {
    console.log(data)
    return api.post('/organization', data)
  },
  update() {
    return api.get('/counterparty')
  },
  remove(id) {
    return api.delete(`/currency/${id}`)
  },
}