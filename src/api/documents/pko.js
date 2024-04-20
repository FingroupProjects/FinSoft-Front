import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('withdrawal', { params });
  },
  paymentFromClient(data) {
    return api.post('cashStore/clientPayment', data)
  },
  writeOff(data) {
    return api.post('withdrawal', data)
  },
  // getById(id) {
  //   return api.get(`/document/show/${id}`)
  // },
  // update(id, data) {
  //   return api.patch(`/document/update/${id}`, data)
  // },
}