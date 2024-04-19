import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/movement', { params });
  },
  add(data) {
    return api.post('/document/movement', data)
  },
  getById(id) {
    return api.get(`/document/movement/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/movement/${id}`, data)
  },
}