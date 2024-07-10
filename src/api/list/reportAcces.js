import { api } from "../api.js";

export default {
  get(id) {
    return api.get(`/permission/report/${id}`, {
      headers: { permission: true },
    });
  },
  create(id, data) {
    return api.post(`/permission/report/${id}`, data, {
      headers: { permission: true },
    });
  },
};
