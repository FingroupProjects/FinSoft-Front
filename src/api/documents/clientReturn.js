import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/client/returnList', { params });
  },
  add(data) {
    return api.post('/document/client/return', data)
  },
  getById(id) {
    return api.get(`/document/show/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/update/${id}`, data)
  },
  approve(data) {
    return api.post(`/document/client/return/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/client/return/unApprove/`, data)
  },
  remove(data) {
    return api.post('/document/client/return/massDelete', data)
  },
  restore(data) {
    return api.post('/document/client/return/massRestore', data)
  }
}