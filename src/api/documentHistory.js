import { api } from './api.js'

export default {
  gety(id) {
    return api.get(`/document/changeHistory/${id}`)
  }
}