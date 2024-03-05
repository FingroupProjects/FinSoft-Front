import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/employee', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/employee', { params });
  },
  show(id) {
    return api.get(`/employee/${id}`)
  },
  update(id, body) {
    return api.patch(`/employee/${id}`, body)
  },
  remove(ids) {
    return api.post('/employee/massRemove', ids)
  },
  restore(ids) {
    return api.post('/employee/massRestore', ids)
  }
}