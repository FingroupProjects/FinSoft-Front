import {api, buildParams} from '../api.js'

export default {
  add(data) {
    return  api.post('/cashRegister', data)
  },
  get({page = 1, itemsPerPage = 10, sortBy} = {}, search = '', filterData = {} ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/cashRegister', { params });
  },
  update(id, body) {
    return api.patch(`/cashRegister/${id}`, body)
  },
  delete(id) {
    return api.delete(`/cashRegister/${id}`)
  },

  massDeletion(data) {
    return api.post('/cashRegister/massDelete', data)
  },
  massRestore(data) {
    return api.post('/cashRegister/massRestore', data)
  },
  excel() {
    return api.get('/cashRegister/excel/export', {
      responseType: 'blob'
    })
  }
}