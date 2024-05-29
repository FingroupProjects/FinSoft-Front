import { api, buildParams } from '../api.js'

export default {
  get(id,{page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/report/reconciliation-report/${id}`, { params });
  },
  excel(id) {
    return api.get(`/report/reconciliation-report/export/${id}`, {
      responseType: 'blob'
    })
  }
}
