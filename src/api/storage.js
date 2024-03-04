import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/storage', data)
  },
  addEmployee(data) {
    return  api.post('/storage', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/storage', { params });
  },
  getStorageEmployee({page = 1, itemsPerPage = 10, sortBy}, search, id) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/storage/get-employees-by-storage_id/${id}`, { params });
  },
  update(id, body) {
    return api.patch(`/storage/${id}`, body)
  },
  massDeletion(data) {
    return api.post('/storage/massDelete', data)
  },
  massRestore(data) {
    return api.post('/storage/massRestore', data)
  },

  delete(id) {
    return api.delete(`/storage/${id}`)
  }
}