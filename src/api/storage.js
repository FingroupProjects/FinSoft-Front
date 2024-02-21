import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/storage', data)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/storage', { params });
  },
  show(id) {
    return api.get(`/stprage/${id}`)
  },
  update(id, body) {
    return api.patch(`/storage/${id}`, body)
  },
  delete(id) {
    return api.delete(`/storage/${id}`)
  }
}