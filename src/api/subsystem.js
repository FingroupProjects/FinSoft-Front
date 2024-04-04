import { api } from "./api.js";

export default {
  get(id) {
    return api.get(`/permission/podsystem/${id}`);
  },
  create(id, data) {
    return api.post(`/permission/podsystem/${id}`, data);
  },
};
