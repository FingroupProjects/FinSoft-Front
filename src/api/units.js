import { api, buildParams } from "./api.js";

export default {
  create(data) {
    return api.post("/counterparty", data);
  },
  update(id, data) {
    return api.patch(`/counterparty/${id}`, data);
  },
  get() {
    return api.get("/units");
  },
};
