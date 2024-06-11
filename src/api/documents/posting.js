import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/provider/purchaseList', { params });
  },
  add(data) {
    return api.post('/document/provider/purchase', data)
  },
  getById(id) {
    return api.get(`/document/show/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/client/update/${id}`, data)
  },
  approve(data) {
    return api.post(`/document/purchase/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/purchase/unApprove/`, data)
  },
  remove(data) {
    return api.post('/document/client/delete', data)
  },
  restore(data) {
    return api.post('/document/client/restore', data)
  }
}