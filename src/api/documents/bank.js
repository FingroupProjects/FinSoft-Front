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
    return api.get(`checking-account/${type}`, { params });
  },
  getById(id) {
    return api.get(`/checking-account/show/${id}`);
  },
  getTypes(type = "RKO") {
    return api.get(`/operationTypes`, {
      params: {
        type: type,
      },
    });
  },

  // create
  paymentFromClient(data) {
    return api.post("checking-account/client-payment", data);
  },
  writeOff(data) {
    return api.post("checking-account/withdrawal", data);
  },
  anotherCashRegister(data) {
    return api.post("checking-account/another-cash-register", data);
  },
  investment(data) {
    return api.post("checking-account/investment", data);
  },
  creditReceive(data) {
    return api.post("checking-account/credit-receive", data);
  },
  providerRefund(data) {
    return api.post("checking-account/provider-refund", data);
  },
  accountablePersonRefund(data) {
    return api.post("checking-account/accountable-person-refund", data);
  },
  otherExpenses(data) {
    return api.post("checking-account/other-expenses", data);
  },
  otherIncomes(data) {
    return api.post("checking-account/other-incomes", data);
  },

  // update
  updatePaymentFromClient(id, data) {
    return api.patch(`checking-account/client-payment/${id}`, data);
  },
  updateWriteOff(id, data) {
    return api.patch(`checking-account/withdrawal/${id}`, data);
  },
  updateAnotherCashRegister(id, data) {
    return api.patch(`checking-account/another-cash-register/${id}`, data);
  },
  updateInvestment(id, data) {
    return api.patch(`checking-account/investment/${id}`, data);
  },
  updateCreditReceive(id, data) {
    return api.patch(`checking-account/credit-receive/${id}`, data);
  },
  updateProviderRefund(id, data) {
    return api.patch(`checking-account/provider-refund/${id}`, data);
  },
  updateAccountablePersonRefund(id, data) {
    return api.patch(`checking-account/accountable-person-refund/${id}`, data);
  },
  updateOtherExpenses(id, data) {
    return api.patch(`checking-account/other-expenses/${id}`, data);
  },
  updateOtherIncomes(id, data) {
    return api.patch(`checking-account/other-incomes/${id}`, data);
  },
  // update(id, data) {
  //   return api.patch(`/document/update/${id}`, data)
  // },
  approve(data) {
    return api.post(`/checking-account/approve/`, data)
  },
  unApprove(data) {
    return api.post(`/checking-account/unApprove/`, data)
  },
  remove(data) {
    return api.post('/checking-account/massDelete', data)
  },
  restore(data) {
    return api.post('/checking-account/massRestore', data)
  }
};
