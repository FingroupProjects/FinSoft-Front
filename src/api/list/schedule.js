import {api, buildParams} from '../api.js'

export default {
  get({page = 1, itemsPerPage = 10, sortBy}, search = '', filter = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filter);

    return api.get('/schedule', { params });
  },
  add(data) {
    return api.post('/schedule', data)
  },
  show(id) {
    return api.get(`/schedule/${id}`)
  },
  update(id, body) {
    return api.patch(`/schedule/${id}`, body)
  },
  remove(ids) {
    return api.post(`/schedule/massDelete`, ids)
  },
  restore(ids) {
    return api.post(`/schedule/massRestore`, ids)
  },
  month() {
    return api.get('/months')
  },
  calculateHours(body) {
    return api.post('/calculateHours', body, { headers: { permission: true } })
  }
}