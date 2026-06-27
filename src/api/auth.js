import axios from 'axios'
import {getAPISRV} from '@/global.js'

export async function login(username, password, server) {
  if (server && !server.startsWith('http://') && !server.startsWith('https://')) {
    server = 'https://' + server
  }
  const resp = await axios.post(`${server}/web/auth/login`, {username, password})
  return resp.data
}

export async function changePassword(old_password, new_password, new_username) {
  const resp = await axios.post(`${getAPISRV()}/web/auth/change-password`, {old_password, new_password, new_username})
  return resp.data
}

export async function fetchMe() {
  const resp = await axios.get(`${getAPISRV()}/web/auth/me`)
  return resp.data
}

export async function listUsers() {
  const resp = await axios.get(`${getAPISRV()}/web/users`)
  return resp.data
}

export async function createUser({username, password, role, scope}) {
  const resp = await axios.post(`${getAPISRV()}/web/users`, {username, password, role, scope})
  return resp.data
}

export async function updateUser(id, payload) {
  const resp = await axios.put(`${getAPISRV()}/web/users/${id}`, payload)
  return resp.data
}

export async function deleteUser(id) {
  const resp = await axios.delete(`${getAPISRV()}/web/users/${id}`)
  return resp.data
}

export async function verifyPassword(password) {
  const resp = await axios.post(`${getAPISRV()}/web/auth/verify-password`, {password})
  return resp.data
}

export async function confirmAction(password, action) {
  await verifyPassword(password)
  return action({ headers: { 'X-Verify-Password': password } })
}
