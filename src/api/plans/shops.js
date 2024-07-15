import { api, buildParams } from '../api.js'
import {id} from "vuetify/locale";

export default{
    add(data){
        return api.post('/plan/storages', data)
    },
    get({page = 1, itemsPerPage = 10, sortBy}, search = "", filterData = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
        return api.get('/plan/storages', { params });
    },
    getById(id){
        return api.get(`/plan/storages/${id}`);
    },
    update(id, body){
        return api.patch(`/plan/storages/${id}`, body);
    },
    remove(data){
        return api.post('/plan/storages/massDelete', data)
    },
    restore(data) {
        return api.post('plan/storages/massRestore', data)
    }
}