import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/currency', data)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/currency', { params });
  },
  addRate(data, id) {
    return api.post(`/currencyRate/add/${id}`, data)
  },
  showRate(id) {
    return api.get(`/currencyRate/${id}`)
  },
  update() {

  },
  delete() {

  }
}