import {api, buildParams} from './api.js';

export default {
  add(data) {
    return  api.post('/group', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search, type) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/group/${type}`, { params });
  },
  update(id, body) {
    return api.patch(`/group/${id}`, body)
  },
  delete(id) {
    return api.delete(`/group/${id}`)
  },
}