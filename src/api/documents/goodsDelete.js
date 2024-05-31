import { api, buildParams } from '../api.js'

export default {
  delete(data) {
    return api.post('/document/delete-document-goods', data);
  }
}