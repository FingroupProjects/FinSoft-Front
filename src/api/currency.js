import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/currency', data)
  },
  show(id) {
    return api.get(`/currency/${id}`)
  },
  edit(id, body) {
    return api.patch(`/currency/${id}`, body)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/currency', { params });
  },
  addRate(data, id) {
    return api.post(`/currencyRate/add/${id}`, data)
  },
  showRate(id, page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get(`/currencyRate/${id}`, { params })
  },
  update() {

  },
  delete() {

  }
}