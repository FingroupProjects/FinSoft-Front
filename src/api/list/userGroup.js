import {api, buildParams} from '../api.js';

export default {
  add(data) {
    return  api.post('/group', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy} = {}, search = '', filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/group/users-group`, { params });
  },
  getUsers({page = 1, itemsPerPage = 10, sortBy}, search, id, filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/group/get-users/${id}`, { params });
  },
  update(id, body) {
    return api.patch(`/group/${id}`, body)
  },
  delete(id) {
    return api.delete(`/group/${id}`)
  },
  restore(id) {
    return api.get(`/group/restore/${id}`)
  }
}