import { api, buildParams } from "../api.js";

export default {
  get({ page = 1, itemsPerPage = 25, sortBy }, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get("document/client/purchasedList", { params });
  },
  add(data) {
    return api.post("/document/client/purchase", data);
  },
  getById(id) {
    return api.get(`/document/show/${id}`);
  },
  update(id, data) {
    return api.patch(`/document/update/${id}`, data);
  },
  approve(data) {
    return api.post(`/document/client/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/document/client/unApprove/`, data)
  },
};
