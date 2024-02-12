import axios from 'axios'
import {getToken} from "../composables/auth/index.js";

const headers = {
  'Accept': 'application/json',
  Authorization: `Bearer ${getToken()}`
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers,
});