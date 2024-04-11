import {api, buildParams} from '../api.js'

export default {
  getAll({page = 1, itemsPerPage = 25, sortBy}, search, filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
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
  remove(data) {
    return api.post(`/organizationBill/massDelete/`, data);
  },
  restore(data) {
    return api.post('/organizationBill/massRestore/', data);
  },
  filter(body) 
  {
    return api.get('/organizationBill/filter', body)
  }


}