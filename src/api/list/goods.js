import { api, buildParams } from "../api.js";

export default {
  create(data) {
    return api.post("/good", data);
  },
  update(id, data) {
    return api.post(`/good/${id}`, data);
  },
  get( { page = 1, itemsPerPage = 10, sortBy } = {}, search = "", good_storage_id, good_organization_id, for_sale = 0,) {
    const params = buildParams( page, itemsPerPage, sortBy, search, );
    // params.for_sale = Number(for_sale)
    params.good_storage_id = good_storage_id
    params.good_organization_id = good_organization_id
    return api.get("/good", { params });
  },
  getById(id) {
    return api.get(`/good/${id}`);
  },
  massDeletion(data) {
    return api.post(`/goods/massDelete/`, data);
  },
  massRestore(data) {
    return api.post(`/goods/massRestore/`, data);
  },

  // good-image
  getImages(id, { page = 1, itemsPerPage = 10 }) {
    const params = buildParams(page, itemsPerPage);
    return api.get(`/image/${id}`, { params });
  },
  createImage(data) {
    return api.post(`/image/`, data);
  },
  deleteImage(id) {
    return api.delete(`/image/${id}`);
  },
  getGoodBySearch(good, filterData = {}) {
    return api.get(`good/`, {
      params:
        {
          search: good,
          ...filterData
        }
    })
  }
};
