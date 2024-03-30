import {api, buildParams} from './api.js'

export default {
  add(data) {
    return  api.post('/employee', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy}, search = '') {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/employee', { params });
  },
  show(id) {
    return api.get(`/employee/${id}`)
  },
  update(id, body) {
    return api.post(`/employee/${id}`, body)
  },
  massDeletion(data) {
    return api.post('/employees/massDelete', data)
  },
  massRestore(data) {
    return api.post('/employees/massRestore', data)
  },
  deleteImage(id) {
    return api.delete(`/employee/delete-image/${id}`)
  },
}