import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/inventory', { params });
  },
  add(data) {
    return api.post('/document/inventory', data)
  },
  getById(id) {
    return api.get(`/document/inventory/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/inventory/${id}`, data)
  },
  approve(data) {
    return api.post(`/document/inventory/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/inventory/unApprove/`, data)
  },
  remove(data) {
    return api.post('/document/inventory/massDelete', data)
  },
  restore(data) {
    return api.post('/document/inventory/massRestore', data)
  }
}