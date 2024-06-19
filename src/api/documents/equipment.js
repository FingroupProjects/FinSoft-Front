import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/equipment', { params });
  },
  add(data) {
    return api.post('/document/equipment', data)
  },
  getById(id) {
    return api.get(`/document/equipment/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/equipment/${id}`, data)
  },
  approve(data) {
    return api.post(`/document/equipment/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/purchase/unApprove/`, data)
  },
  remove(data) {
    return api.post('/document/equipment/delete', data)
  },
  restore(data) {
    return api.post('/document/equipment/restore', data)
  }
}