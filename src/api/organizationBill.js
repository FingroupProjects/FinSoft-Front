import { api } from './api.js'

export default {
  getAll(){
    return api.get('/organizationBill') 
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
  }


}