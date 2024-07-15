import {api, buildParams} from '../api.js'

export default {
    getRko({page = 1, itemsPerPage = 10, sortBy}, search = '', filter = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filter);
        return api.get('/operationTypes?type=RKO', { params });
    },
    getPko({page = 1, itemsPerPage = 10, sortBy}, search = '', filter = {}) {
        const params = buildParams(page, itemsPerPage, sortBy, search, filter);
        return api.get('/operationTypes?type=PKO', { params });
    },
}