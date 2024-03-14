import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post("/good-group", data);
  },
  get({ page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get("/good-group", { params });
  },
  getById(id, { page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/good-group/get-goods/${id}`, { params });
  },
  massDeletion(data) {
    return api.post(`/good-group/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/good-group/massRestore/`, data);
  },
};

