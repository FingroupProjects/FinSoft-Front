import { api, buildParams } from '../api.js'

export default {
    add(data) {
        return api.post('/plan/operation-types', data)
    },
    get({page = 1, itemsPerPage=25,sortBy}, search = "", filterData = {}){
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/operation-types', { params });
    },
    getById(id) {
        return api.get(`/plan/operation-types/${id}`);
    },
    update(id, body) {
        return api.patch(`/plan/operation-types/${id}`, body)
    },
    remove(data) {
        return api.post('/plan/operation-types/massDelete', data)
    },
    restore(data) {
        return api.post('/plan/operation-types/massRestore', data)
    }
}