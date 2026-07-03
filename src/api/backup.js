import axios from 'axios'
import { getAPISRV } from '@/global.js'

export async function exportBackup(password) {
  return axios.get(`${getAPISRV()}/web/backup/export`, {
    responseType: 'blob',
    headers: { 'X-Verify-Password': password }
  })
}

export async function importBackup(file, password) {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${getAPISRV()}/web/backup/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Verify-Password': password
    }
  })
}

export async function fullExport(password) {
  return axios.post(`${getAPISRV()}/web/backup/full-export`, {}, {
    responseType: 'blob',
    headers: { 'X-Verify-Password': password }
  })
}

export async function fullImport(file, password, mode = 'overwrite') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mode', mode)
  return axios.post(`${getAPISRV()}/web/backup/full-import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Verify-Password': password
    }
  })
}
