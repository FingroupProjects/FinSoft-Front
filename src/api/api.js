import axios from 'axios'
import {getToken} from "../composables/auth/index.js";

const headers = {
  'Accept': 'application/json',
  Authorization: `Bearer 1|2XlJbt6qrxax3yk6k9PglBvzU1lSr7QmKOBiAlmLaf241ef7`
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers,
});