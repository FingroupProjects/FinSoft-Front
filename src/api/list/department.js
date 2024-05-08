import {api, buildParams} from '../api.js'

export default {
  add(data) {
    return api.post('/department', data)
  },
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/department', { params });
  },
  update(id, body) {
    return api.patch(`/department/${id}`, body)
  },
  delete(id) {
    return api.delete(`/department/${id}`)
  },

  massDeletion(data) {
    return api.post(`/department/massDelete/`, data);
  },

  restore(id) {
    return api.get(`/department/restore/${id}`)
  },

  massRestore(data) {
    return api.post('/department/massRestore', data)
  }
}