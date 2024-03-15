import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post("/good", data);
  },
  update(id, data) {
    return api.patch(`/good/${id}`, data);
  },
  get({ page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get("/good", { params });
  },
  getById(id) {
    return api.get(`/good/${id}`);
  },
  massDeletion(data) {
    return api.post(`/good/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/good/massRestore/`, data);
  },
};
