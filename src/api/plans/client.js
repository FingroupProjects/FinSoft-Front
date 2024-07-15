import { api, buildParams } from '../api.js'

export default{
    add(data){
        return api.post('/plan/client',data)
    },
    get({page = 1, itemsPerPage=25,sortBy}, search = "", filterData = {}){
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/client', { params });
    },
    getById(id){
        return api.get(`/plan/client/${id}`);
    },
    update(id, body){
        return api.patch(`/plan/client/${id}`, body)
    },
    remove(data){
        return api.post('/plan/client/massDelete', data)
    },
    restore(data){
        return api.post('/plan/client/massRestore', data)
    }
}