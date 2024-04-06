import { api } from "./api.js";

export default {
  get(id) {
    return api.get(`/permission/podsystem/${id}`, {
      headers: { permission: true },
    });
  },
  create(id, data) {
    return api.post(`/permission/podsystem/${id}`, data, {
      headers: { permission: true },
    });
  },
};
