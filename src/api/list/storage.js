import {api, buildParams} from '../api.js'

export default {
  add(data) {
    return  api.post('/storage', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/storage', { params });
  },
  getStorageEmployee({page = 1, itemsPerPage = 10, sortBy}, search, id) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/storage/get-employees-by-storage_id/${id}`, { params });
  },
  addStorageEmployee(id, body) {
    return api.post(`/storage/add-employee/${id}`, body);
  },

  update(id, body) {
    return api.patch(`/storage/${id}`, body)
  },

  updateEmployee(id, body) {
    return api.patch(`/storage/update-employee/${id}`, body)
  },

  massDeletion(data) {
    return api.post('/storage/massDelete', data)
  },
  massRestore(data) {
    return api.post('/storage/massRestore', data)
  },

  massDeletionEmployee(data) {
    return api.post('/storage/massDeleteEmployee', data)
  },
  massRestoreEmployee(data) {
    return api.post('/storage/massRestoreEmployee', data)
  },
  showEmployee(id) {
    return api.get(`/storage/${id}`)
  },

  delete(id) {
    return api.delete(`/storage/${id}`)
  },
}