import { api, buildParams } from '../api.js'

export default{
    add(data) {
        return api.post('/plan/goods', data)
      },
      get({page = 1, itemsPerPage = 25, sortBy}, search = "", filterData = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/goods', { params });
      },
      getGoodsByGroupId(data){
          return api.get('goods/goods-by-group-ids', {
            params: {
              ids: data.ids
            }
          });
      },
      getById(id) {
        return api.get(`/plan/goods/${id}`);
      },
      update(id, body) {
        return api.patch(`/plan/goods/${id}`, body)
      },
      remove(data) {
        return api.post('plan/goods/massDelete', data)
      },
      restore(data) {
        return api.post('plan/goods/massRestore', data)
      }

}