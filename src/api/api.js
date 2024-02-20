import axios from 'axios'
import {getToken} from "../composables/auth/index.js";

const headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer 28|mXBxSLIWtK9dN3jVThq2o2RmqiABSAbugSot21ir6b9dbf03'
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers,
});

export function buildParams(page = 1, itemsPerPage = 10, sortBy) {
  const params = {
    page: page,
    itemsPerPage: itemsPerPage
  };

  if (sortBy && sortBy.length > 0) {
    params.orderBy = sortBy[0].key;
    params.sort = sortBy[0].order;
  }

  return params;
}