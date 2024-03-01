import { api, buildParams } from './api.js'

export default {
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/organization', { params });
  },
  update(id, body) {
    return api.patch(`/organization/${id}`, body)
  },
  add(data) {
    console.log(data)
    return api.post('/organization', data)
  },
  remove(id) {
    return api.delete(`/organization/${id}`)
  },
}