import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/unit', data)
  },
  get({page = 1, itemsPerPage = 25, sortBy}, search, filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/unit', { params });
  },
  update(id, body) {
    return api.patch(`/unit/${id}`, body)
  },
  delete(id) {
    return api.delete(`/unit/${id}`)
  },
  massDeletion(data) {
    return api.post(`/units/massDelete/`, data);
  },

  restore(id) {
    return api.get(`/unit/restore/${id}`)
  },

  massRestore(data) {
    return api.post('/unit/massRestore', data)
  }
}