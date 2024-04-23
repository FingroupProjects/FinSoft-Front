import { api, buildParams } from "../api.js";

export default {
  get({ page = 1, itemsPerPage = 25, sortBy }, search = "", filterData = {}) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get("cash-store/client-payment", { params });
  },
  paymentFromClient(data) {
    return api.post("cash-store/client-payment", data);
  },
  writeOff(data) {
    return api.post("cash-store/withdrawal", data);
  },
  anotherCashRegister(data) {
    return api.post("cash-store/another-cash-register", data);
  },
  investment(data) {
    return api.post("cash-store/investment", data);
  },
  creditReceive(data) {
    return api.post("cash-store/credit-receive", data);
  },
  providerRefund(data) {
    return api.post("cash-store/provider-refund", data);
  },
  accountablePersonRefund(data) {
    return api.post("cash-store/accountable-person-refund", data);
  },
  otherExpenses(data) {
    return api.post("cash-store/other-expenses", data);
  },
  otherIncomes(data) {
    return api.post("cash-store/other-incomes", data);
  },
  // getById(id) {
  //   return api.get(`/document/show/${id}`)
  // },
  // update(id, data) {
  //   return api.patch(`/document/update/${id}`, data)
  // },
};
