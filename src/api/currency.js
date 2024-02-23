import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/currency', data)
  },
  show(id) {
    return api.get(`/currency/${id}`)
  },
  update(id, body) {
    return api.patch(`/currency/${id}`, body)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/currency', { params });
  },
  remove(id) {
    return api.delete(`/currency/${id}`)
  },
  addRate(data, id) {
    return api.post(`/currencyRate/add/${id}`, data)
  },
  showRate(id, {page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/currencyRate/${id}`, { params })
  },
  updateRate(id, body) {
    return api.patch(`/currencyRate/${id}`, body)
  },
}