import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/priceType', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/priceType', { params });
  },
  update(id, body) {
    return api.patch(`/priceType/${id}`, body)
  },
  delete(id) {
    return api.delete(`/priceType/${id}`)
  },
  massDeletion(data) {
    return api.post(`/priceType/massDelete/`, data);
  },
  massRestore(data) {
    return api.post('/priceType/massRestore/', data);
  },
}