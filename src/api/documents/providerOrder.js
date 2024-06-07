import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/provider/orderList', { params });
  },
  add(data) {
    return api.post('/document/provider/order', data)
  },
  getById(id) {
    return api.get(`/document/provider/order/show/${id}`)
  },
  update(id, data) {
    return api.patch(`/document/client/update-order/${id}`, data)
  },
  remove(data) {
    return api.post('/document/provider/order/massDelete', data)
  },
  restore(data) {
    return api.post('/document/provider/order/massRestore', data)
  },
  approve(data) {
    return api.post(`/document/provider/order/approve`, data)
  },
  unApprove(data) {
    return api.post(`/document/provider/order/unApprove`, data)
  },
}