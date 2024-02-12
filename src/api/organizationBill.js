import { api } from './api.js'
import {getToken} from '../composables/auth'

export default {
  index(){
    return api.get('/organizationBill') 
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