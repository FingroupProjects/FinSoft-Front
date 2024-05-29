import { api, buildParams } from "../api.js";

export default {
  create(data) {
    return api.post("/good-group", data);
  },
  update(id, data) {
    return api.patch(`/good-group/${id}`, data);
  },
  get({ page = 1, itemsPerPage = 25, sortBy }, search = "", filterData) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get("/good-group", { params });
  },
  getById(
    id,
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/good-group/get-goods/${id}`, { params });
  },
  getGroupById(id, { page = 1, itemsPerPage = 25, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/good-group/${id}`, { params });
  },
  massDeletion(data) {
    return api.post(`/good-group/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/good-group/massRestore/`, data);
  },
  excel(filterData = {}) {
    return api.get('/goods/excel/export', {
      responseType: 'blob'
    })
  }
};
