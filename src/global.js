const SERVER_KEY = 'astra_server_url'

export function getServer() {
  return localStorage.getItem(SERVER_KEY) || ''
}

export function setServer(url) {
  localStorage.setItem(SERVER_KEY, url)
}

export const APISRV = getServer()
