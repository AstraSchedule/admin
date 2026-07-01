const SERVER_KEY = 'astra_server_url'

export function getServer() {
  return localStorage.getItem(SERVER_KEY) || ''
}

export function setServer(url) {
  localStorage.setItem(SERVER_KEY, url)
}

export function getAPISRV() {
  const url = getServer()
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return (import.meta.env.DEV ? 'http://' : 'https://') + url
  }
  return url
}
