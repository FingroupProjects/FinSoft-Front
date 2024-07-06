import { api, buildParams } from "../api.js";

export default {
  get(data) {
    return api.get("/good-group/get/good-prices", { params: data });
  },
  create(data) {
    return api.post("/price-set-up", data);
  },
  show(id){
    return api.get(`/price-set-up/${id}`);
  },
  update(id, data) {
    return api.patch(`/price-set-up/${id}`, data);
  },
  getData(
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData = {}
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    {
      return api.get("/price-set-up", { params });
    }
  },
};
