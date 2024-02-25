import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post("/cpAgreement", data);
  },
  update(id, data) {
    return api.patch(`/cpAgreement/${id}`, data);
  },
  get({ page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get("/cpAgreement", { params });
  },
  getById(id, page = 1, itemsPerPage = 1, sortBy) {
    const params = buildParams(page, itemsPerPage, sortBy);
    return api.get(`/cpAgreement/${id}`, {
      params,
    });
  },
  getCounterpartyById(id, {page = 1, itemsPerPage = 10, sortBy}, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/cpAgreement/getAgreementByCounterpartyId/${id}`, {
      params,
    });
  },
};
