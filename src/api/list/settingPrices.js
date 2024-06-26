import { api } from "../api.js";

export default {
  get(data) {
    return api.get("/good-group/get/good-prices", { params: data } );
  },
  create(data) {
    return api.post("/price-set-up", data  );
  },
};
