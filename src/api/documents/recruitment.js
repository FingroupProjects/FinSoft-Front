import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/hiring', { params });
  },
  add(data) {
    return api.post('/hiring', data)
  },
  getById(id) {
    return api.get(`/hiring/${id}`)
  },
  update(id, data) {
    return api.patch(`/hiring/${id}`, data)
  },
}