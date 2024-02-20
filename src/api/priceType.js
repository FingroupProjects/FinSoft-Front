import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/priceType', data)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/priceType', { params });
  },
  show(id) {
    return api.get(`/priceType/${id}`)
  },
  update(id, body) {
    return api.patch(`/priceType/${id}`, body)
  },
  delete(id) {
    return api.delete(`/priceType/${id}`)
  }
}