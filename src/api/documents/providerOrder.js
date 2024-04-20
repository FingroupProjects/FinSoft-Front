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
    return api.patch(`/document/update-order/${id}`, data)
  },
}