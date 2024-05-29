import { api, buildParams } from "../api.js";
export default {
  getById(id) {
    return api.get(`/document/createOnBase/${id}`);
  }
}
