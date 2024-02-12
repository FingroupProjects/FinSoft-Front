import axios from 'axios'
import {getToken} from "../composables/auth/index.js";

const headers = {
  'Accept': 'application/json',
  Authorization: `Bearer 54|7sJMqQyz9A3coikNHGcKie6Kcf8RruVAIjodur5xdcce3be9`
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers,
});