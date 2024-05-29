import { api, buildParams } from '../api.js'

export default {
  copy(id) {
    return api.post(`/document/copy/${id}`)
  },
}