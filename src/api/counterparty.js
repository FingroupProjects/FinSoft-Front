import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post("/counterparty", data);
  },
  rename(id, data) {
    return api.patch(`/counterparty/${id}`, data);
  },
  get(page = 1, itemsPerPage = 10, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get('/counterparty', { params });
  },
  getById(id) {
    return api.get(`/counterparty/${id}`);
  },
};
