import axios from 'axios'
import {APISRV} from '@/global.js'

export async function createSchool(name) {
  const resp = await axios.post(`${APISRV}/web/schools`, {name})
  return resp.data
}

export async function deleteSchool(school) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}`)
  return resp.data
}

export async function createGrade(school, name) {
  const resp = await axios.post(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades`, {name})
  return resp.data
}

export async function deleteGrade(school, grade) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}`)
  return resp.data
}

export async function createClass(school, grade, name) {
  const resp = await axios.post(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}/classes`, {name})
  return resp.data
}

export async function deleteClass(school, grade, className) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}/classes/${encodeURIComponent(className)}`)
  return resp.data
}
