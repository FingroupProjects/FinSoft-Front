import { api, buildParams } from "../api.js";

export default {
  // get
  get(
    type = "PKO",
    { page = 1, itemsPerPage = 25, sortBy },
    search = "",
    filterData = {}
  ) {
    const params = buildParams(page, itemsPerPage, sortBy, search, filterData);
    return api.get(`cash-store/${type}`, { params });
  },
  getById(id) {
    return api.get(`/cash-store/show/${id}`);
  },
  getTypes(type = "RKO") {
    return api.get(`/cash-store/operationTypes`, {
      params: {
        type: type,
      },
    });
  },

  // create
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

  // update
  updatePaymentFromClient(id, data) {
    return api.patch(`cash-store/client-payment/${id}`, data);
  },
  updateWriteOff(data) {
    return api.patch("cash-store/withdrawal", data);
  },
  anotherCashRegister(data) {
    return api.patch("cash-store/another-cash-register", data);
  },
  investment(data) {
    return api.patch("cash-store/investment", data);
  },
  creditReceive(data) {
    return api.patch("cash-store/credit-receive", data);
  },
  providerRefund(data) {
    return api.patch("cash-store/provider-refund", data);
  },
  accountablePersonRefund(data) {
    return api.patch("cash-store/accountable-person-refund", data);
  },
  otherExpenses(data) {
    return api.patch("cash-store/other-expenses", data);
  },
  otherIncomes(data) {
    return api.patch("cash-store/other-incomes", data);
  },
  // update(id, data) {
  //   return api.patch(`/document/update/${id}`, data)
  // },
};
