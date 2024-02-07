import axios from 'axios'
const headers = {
  'Accept': 'application/json'
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  headers,
});