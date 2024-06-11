import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const type = "Списание";
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/inventoryOperation/${type}`, { params });
  },
  add(data) {
    return api.post('/inventoryOperation', data)
  },
  getById(id) {
    return api.get(`/inventoryOperation/show/${id}`)
  },
  update(id, data) {
    return api.patch(`/inventoryOperation/${id}`, data)
  },
  approve(data) {
    return api.post(`/inventoryOperation/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/inventoryOperation/unApprove/`, data)
  },
  remove(data) {
    return api.post('/inventoryOperation/massDelete', data)
  },
  restore(data) {
    return api.post('/inventoryOperation/massRestore', data)
  }
}