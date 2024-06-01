export function setToken(token) {
  sessionStorage.setItem('token', token.toString())
}

export function deleteToken() {
  console.log('token deleted');
  sessionStorage.removeItem('token')
}

export function getToken() {
  return sessionStorage.getItem('token')
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function deleteUser() {
  console.log('user deleted');
  localStorage.removeItem('user')
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user'))
}