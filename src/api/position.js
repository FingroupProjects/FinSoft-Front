import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/position', data)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/position', { params });
  },
  show(id) {
    return api.get(`/position/${id}`)
  },
  update(id, body) {
    return api.patch(`/position/${id}`, body)
  },
  delete(id) {
    return api.delete(`/position/${id}`)
  }
}