import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/salaryDocument', { params });
  },
  add(data) {
    return api.post('/salaryDocument', data)
  },
  getById(id) {
    return api.get(`/salaryDocument/${id}`)
  },
  update(id, data) {
    return api.patch(`/salaryDocument/${id}`, data)
  },
  reportCard(data) {
    return api.get('/reportCard/employeeSalary', { params: data })
  }
}