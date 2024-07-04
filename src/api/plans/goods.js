import { api, buildParams } from '../api.js'

export default{
    add(data) {
        return api.post('/plan/goods', data)
      },
      get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/goods', { params });
      },

}