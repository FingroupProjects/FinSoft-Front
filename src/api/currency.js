import { api } from './api.js'

export default {
  add(data) {
    return  api.post('/currency', data)
  },
  get(page = 1, itemPerPage = 10) {
    return  api.get('/currency', {
      params: {
        page: page,
        itemPerPage: itemPerPage
      },
    })
  },
  addRate(data, id) {
    return api.post(`/currencyRate/add/${id}`, data)
  },
  showRate(id) {
    return api.get(`/currencyRate/${id}`)
  },
  update() {

  },
  delete() {

  }
}