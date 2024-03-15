import {api, buildParams} from './api.js'

export default {
  getAll({page = 1, itemsPerPage = 25, sortBy}, search) {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get('/organizationBill', { params })
  },
  getById(id) {
    return api.get(`/organizationBill/${id}`);
  },
  create(data) {
    return api.post('/organizationBill', data)
  },
  update(id, data){
    return  api.patch(`/organizationBill/${id}`, data)
  },
  delete(id, data) {
    return  api.delete(`/organizationBill/${id}`, data)
  },
  massDeletion(data) {
    return api.post(`/organizationBill/massDelete/`, data);
  },
  massRestore(data) {
    return api.post('/organizationBill/massRestore/', data);
  },


}