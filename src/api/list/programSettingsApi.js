import { api } from '../api.js'

export default {
    create(data) {
        return  api.post('/settings', data , { headers: { permission: true } }) 
    },
    get() {
        return api.get('/settings', )
    }
}