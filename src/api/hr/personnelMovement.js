import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/employeeMovement', { params });
  },
  add(data) {
    return api.post('/employeeMovement', data)
  },
  getById(id) {
    return api.get(`/employeeMovement/${id}`)
  },
  update(id, data) {
    return api.patch(`/employeeMovement/${id}`, data)
  },
}