import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/user', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/user', { params });
  },
  show(id) {
    return api.get(`/user/${id}`)
  },
  update(id, body) {
    return api.patch(`/user/${id}`, body)
  },
  remove(ids) {
    return api.post('/user/massRemove', ids)
  },
  restore(ids) {
    return api.post('/user/massRestore', ids)
  }
}