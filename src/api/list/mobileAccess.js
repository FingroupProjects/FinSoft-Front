import { api } from "../api.js";

export default {
  get(id) {
    return api.get(`/permission/mobile/${id}`, {
      headers: { permission: true },
    });
  },
  create(id, data) {
    return api.post(`/permission/mobile/${id}`, data, {
      headers: { permission: true },
    });
  },
};
