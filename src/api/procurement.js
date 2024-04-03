import { api, buildParams } from './api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search, filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/document/provider/purchaseList', { params });
  },
  add(data) {
    return api.post('/document/provider/purchaseList', data)
  }
}