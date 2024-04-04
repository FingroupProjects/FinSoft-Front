import { api } from "./api.js";

export default {
  get(id) {
    return api.get(`/permission/${id}`);
  },
  create(id, data) {
    return api.post(`/permission/${id}`, data);
  },
};
