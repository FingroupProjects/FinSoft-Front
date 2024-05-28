import { api, buildParams } from '../api.js'

export default {
  get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get('/report/counterpartySettlement', { params });
  },
  excel() {
    return api.get('/report/counterpartySettlement/export', {
      responseType: 'blob'
    })
  }
}
