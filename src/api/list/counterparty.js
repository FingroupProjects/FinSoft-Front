import SendMessage from "../../pages/list/counterparty/sendMessage.vue";
import { api, buildParams } from "../api.js";

export default {
  create(data) {
    return api.post("/counterparty", data);
  },
  update(id, data) {
    return api.patch(`/counterparty/${id}`, data);
  },
  get({ page = 1, itemsPerPage = 10, sortBy }, search = "", filterData = {}) {
    const params = buildParams( page, itemsPerPage, sortBy, search, filterData);
    return api.get("/counterparty", { params });
  },
  getById(id) {
    return api.get(`/counterparty/${id}`);
  },
  getClientCounterparty() {
    return api.get(`/counterparty/clients/s`);
  },
  massDeletion(data) {
    return api.post(`/counterparty/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/counterparty/massRestore/`, data);
  },
  excel(filterData = {}) {
    return api.get('/counterparty/data/export',{
      responseType: 'blob'
    })
  },
  getLocation(id) {
    return api.get(`counterparty/coordinates/${id}`)
  },
  createLocation(data) {
    return api.post('counterpartyCoordinates', data)
  },
  sendMessage(data) {
    return api.post('counterparty/send-sms', data)
  }
  
};
