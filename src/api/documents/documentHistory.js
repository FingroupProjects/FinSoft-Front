import { api } from '../api.js'

export default {
  get(id) {
    return api.get(`/document/changeHistory/${id}`)
  },
  balance(id) {
    return api.get(`/document-report/balance/${id}`)
  },
  goodAccountings(id) {
    return api.get(`/document-report/good-accountings/${id}`)
  },
  counterpartySettlements(id) {
    return api.get(`/document-report/counterparty-settlements/${id}`)
  },
}