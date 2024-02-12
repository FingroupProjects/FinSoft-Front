import { api } from "./api.js";
import { getToken } from "../composables/auth";

export default {
  create(data) {
    return api.post("/counterparty", data);
  },
  rename(id, data) {
    return api.patch(`/counterparty/${id}`, data);
  },
  get() {
    return api.get("/counterparty");
  },
  getById(id) {
    return api.get(`/counterparty/${id}`);
  },
};
