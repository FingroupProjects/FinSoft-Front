import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post(`/barcode`, data);
  },
  get({ page = 1, itemsPerPage = 100, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get("/barcode", { params });
  },
  update(id, data) {
    return api.patch(`/barcode/${id}`, data);
  },
  getById(id, { page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/barcode/${id}`, { params });
  },
  getBarcodeById(id, { page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get(`/barcode/${id}`, { params });
  },
  massDeletion(data) {
    return api.post(`/barcode/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/barcode/massRestore/`, data);
  },
};
