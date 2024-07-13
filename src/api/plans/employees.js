import { api, buildParams } from '../api.js'
export default {
    add(data){
        return api.post('/plan/employees', data)
    },
    get({page = 1, itemsPerPage = 10, sortBy}, search = "", filterData = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/employees', { params });
    },
    getById(id){
        return api.get(`/plan/employees/${id}`);
    },
    update(id, body){
        return api.patch(`/plan/employees/${id}`, body)
    }

}