import { api } from "../api.js";

export default {
  get(id) {
    return api.get(`/permission/${id}`, { headers: { permission: true } });
  },
  create(id, data) {
    return api.post(`/permission/${id}`, data, {
      headers: { permission: true },
    });
  },
};
