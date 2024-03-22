import {api, buildParams} from './api.js';

export default {
  add(data) {
    return  api.post('/group', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/group/storages-group`, { params });
  },
  getStorages({page = 1, itemsPerPage = 10, sortBy}, search = '', id, filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search = '', filterData);
    return api.get(`/group/get-storages/${id}`, { params });
  },
  update(id, body) {
    return api.patch(`/group/${id}`, body)
  },
  delete(id) {
    return api.delete(`/group/${id}`)
  },
}