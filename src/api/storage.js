import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/storage', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/storage', { params });
  },
  update(id, body) {
    return api.patch(`/storage/${id}`, body)
  },
  delete(id) {
    return api.delete(`/storage/${id}`)
  }
}