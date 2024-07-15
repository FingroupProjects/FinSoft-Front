import { api, buildParams } from '../api.js'

export default {
    add(data){
        return api.post('/plan/installment',data)
    },
    get({page = 1, itemsPerPage=25,sortBy}, search = "", filterData = {}){
       const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
       return api.get('/plan/installment', { params });
    },
    getGoodsByGroupId(data){
        return api.get('goods/goods-by-group-ids', {
            params: {
                ids: data.ids
            }
        });
    },
    getById(id) {
        return api.get(`/plan/installment/${id}`);
    },
    update(id, body) {
        return api.patch(`/plan/installment/${id}`, body)
    },
    remove(data) {
        return api.post('/plan/installment/massDelete', data)
    },
    restore(data) {
        return api.post('/plan/installment/massRestore', data)
    }

}