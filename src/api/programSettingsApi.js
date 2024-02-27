import { api } from './api.js'

export default {
    create(data) {
        return  api.post('/settings', data)
    },
    get() {
        return api.get('/settings', )
    }
}