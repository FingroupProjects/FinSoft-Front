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
  massDeletion(data) {
    return api.post(`/counterparty/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/counterparty/massRestore/`, data);
  },
};
