import {api, buildParams} from '../api.js'

export default {
  get({page = 1, itemsPerPage = 10, sortBy}, search = '', filter = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filter);

    return api.get('/worker-schedule', { params });
  },
  add(data) {
    return  api.post('/worker-schedule', data, { headers: { permission: true } })
  },
  show(id) {
    return api.get(`/worker-schedule/${id}`)
  },
  update(id, body) {
    return api.patch(`/worker-schedule/${id}`, body)
  },
  remove(ids) {
    return api.post(`/worker-schedule/massDelete`, ids)
  },
  restore(ids) {
    return api.post(`/worker-schedule/massRestore`, ids)
  },
  month() {
    return api.get('/months')
  },
  calculateHours(body) {
    return api.post('/calculateHours', body, { headers: { permission: true } })
  }
}