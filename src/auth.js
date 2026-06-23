import axios from 'axios'
import {APISRV} from './global.js'

const TOKEN_KEY = 'astra_jwt_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

export function getAuthHeaders() {
  const token = getToken()
  if (token) {
    return {Authorization: `Bearer ${token}`}
  }
  return {}
}

export async function fetchMe() {
  const resp = await axios.get(`${APISRV}/web/auth/me`, {headers: getAuthHeaders()})
  return resp.data
}
