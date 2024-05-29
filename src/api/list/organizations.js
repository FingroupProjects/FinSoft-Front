import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 1000, sortBy} = {}, search = '', filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/organization', { params });
  },
  update(id, body) {
    return api.patch(`/organization/${id}`, body)
  },
  add(data) {
    return api.post('/organization', data)
  },
  getById(id) {
    return api.get(`/organization/${id}`);
  },
  remove(data) {
    return api.post(`/organization/massDelete/`, data);
  },
  restore(data) {
    return api.post(`/organization/massRestore/`, data);
  },
  filter(body) 
  {
    return api.get(`/organization/filter`, body)
  },
  excel() {
    return api.get(`/organization/excel/export/`, {
      responseType: 'blob'
    })
  }
}
