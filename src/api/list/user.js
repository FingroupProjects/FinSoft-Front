import {api, buildParams} from '../api.js'

export default {
  add(data) {
    return  api.post('/user', data)
  },
    get({page = 1, itemsPerPage = 10, sortBy}, search = '', filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/user', { params });
  },

  getAuthors() {
    return api.get('/document/document-author');
  },
  show(id) {
    return api.get(`/user/${id}`)
  },
  update(id, body) {
    return api.post(`/user/${id}`, body)
  },
  remove(ids) {
    return api.post('/users/massDelete', ids)
  },
  restore(ids) {
    return api.post('/users/massRestore', ids)
  },
  password(id, body) {
    return api.post(`/users/change-password/${id}`, body)
  },
  deleteImage(id) {
    return api.delete(`/user/delete-image/${id}`)
  },
}