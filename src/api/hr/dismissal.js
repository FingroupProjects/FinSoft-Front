import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/firing', { params });
  },
  add(data) {
    return api.post('/firing', data)
  },
  getById(id) {
    return api.get(`/firing/${id}`)
  },
  update(id, data) {
    return api.patch(`/firing/${id}`, data)
  },
}