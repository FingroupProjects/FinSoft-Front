export function createAccess(access) {
  const users = JSON.parse(localStorage.getItem('user'))
  const permissions = users.permissions
  return permissions.includes(`${access}.create`)
}

export function readAccess(access) {
  const users = JSON.parse(localStorage.getItem('user'))
  const permissions = users.permissions
  return permissions.includes(`${access}`)
}

export function updateAccess(access) {
  const users = JSON.parse(localStorage.getItem('user'))
  const permissions = users.permissions

  return permissions.includes(`${access}.update`)
}

export function removeAccess(access) {
  const users = JSON.parse(localStorage.getItem('user'))
  const permissions = users.permissions

  return permissions.includes(`${access}.delete`)
}