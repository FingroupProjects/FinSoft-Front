import {api, buildParams} from '../api.js'

export default {
  add(data) {
    return  api.post('/position', data)
  },
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/position', { params });
  },
  update(id, body) {
    return api.patch(`/position/${id}`, body)
  },
  delete(id) {
    return api.delete(`/position/${id}`)
  },

  massDeletion(data) {
    return api.post(`/position/massDelete/`, data);
  },

  restore(id) {
    return api.get(`/position/restore/${id}`)
  },

  massRestore(data) {
    return api.post('/position/massRestore', data)
  },
  excel(id) {
    return api.get(`/position/export/excel`, {
      responseType: 'blob'
    })
  }
}