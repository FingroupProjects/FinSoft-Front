import {api, buildParams} from '../api.js'

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
  get({page = 1, itemsPerPage = 10, sortBy}, search = '', filter) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filter);

    return api.get('/currency', { params });
  },
  remove(ids) {
    return api.post(`/currency/massDelete`, ids)
  },
  restore(ids) {
    return api.post(`/currency/massRestore`, ids)
  },
  addRate(id, body) {
    return api.post(`/currencyRate/add/${id}`, body)
  },
  showRate(id, {page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/currencyRate/${id}`, { params })
  },
  updateRate(id, body) {
    return api.patch(`/currencyRate/${id}`, body)
  },
  removeRate(ids) {
    return api.post('/currencyRate/massDelete', ids)
  },
  restoreRate(ids) {
    return api.post('/currencyRate/massRestore', ids)
  },
  excel() {
    return api.get(`/currency/export/excel`, {
      responseType: 'blob'
    })
  }
}