export function setToken(token) {
  localStorage.setItem('token', token.toString())
}

export function deleteToken() {
  localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function deleteUser() {
  localStorage.removeItem('user')
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user'))
}