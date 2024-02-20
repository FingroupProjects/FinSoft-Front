import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/cashRegister', data)
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/cashRegister', { params });
  },
  show(id) {
    return api.get(`/cashRegister/${id}`)
  },
  update(id, body) {
    return api.patch(`/cashRegister/${id}`, body)
  },
  delete(id) {
    return api.delete(`/cashRegister/${id}`)
  }
}