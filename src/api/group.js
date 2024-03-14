import { api } from "./api.js"

export default {
  add(data) {
    return api.post("/group", data)
  },
  get() {
    return api.get("/group")
  }
}
