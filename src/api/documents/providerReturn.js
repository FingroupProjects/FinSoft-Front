import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/provider/returnList', { params });
  },
  add(data) {
    return api.post('/document/provider/return', data)
  },
  getById(id) {
    return api.get(`/document/show/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/update/${id}`, data)
  },
  remove(data) {
    return api.post('/document/provider/return/massDelete', data)
  },
  restore(data) {
    return api.post('/document/provider/return/massRestore', data)
  },
  approve(data) {
    return api.post(`/document/return/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/return/unApprove/`, data)
  },
}