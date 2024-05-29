import { api, buildParams } from "../api.js";

export default {
  get({ page = 1, itemsPerPage = 10, sortBy }, search = "") {
    const params = buildParams(page, itemsPerPage, sortBy, search);
    return api.get("cash-store/other-expenses/balance-article", { params });
  },
  
};
