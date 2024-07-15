import { api, buildParams } from '../api.js'

export default{
    add(data){
        return api.post('/plan/expense-item',data)
    },
    get({page = 1, itemsPerPage=25,sortBy}, search = "", filterData = {}){
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/expense-item', { params });
    },
    getById(id){
        return api.get(`/plan/expense-item/${id}`);
    },
    update(id, body){
        return api.patch(`/plan/expense-item/${id}`, body)
    },
    remove(data){
        return api.post('/plan/expense-item/massDelete', data)
    },
    restore(data){
        return api.post('/plan/expense-item/massRestore', data)
    }
}