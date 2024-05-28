import { api, buildParams } from '../api.js'

export default {
  delete(data) {
    return api.post('/document/delete', data)
  },
  restore(data) {
    return api.post('/document/restore', data)
  }
}