import { api, buildParams } from "../api.js";

export default {
  get(id) {
    return api.get(`/document/changeHistory/${id}`);
  },
  balance(
    id,
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData = {}
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/document-report/balance/${id}`, params);
  },
  goodAccountings(
    id,
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData = {}
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/document-report/good-accountings/${id}`, params);
  },
  counterpartySettlements(
    id,
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData = {}
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`/document-report/counterparty-settlements/${id}`, params);
  },
};
