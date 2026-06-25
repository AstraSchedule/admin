import axios from 'axios'
import {APISRV} from '@/global.js'

export async function createSchool(name, cfg) {
  const resp = await axios.post(`${APISRV}/web/schools`, {name}, cfg)
  return resp.data
}

export async function deleteSchool(school, cfg) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}`, cfg)
  return resp.data
}

export async function createGrade(school, name, cfg) {
  const resp = await axios.post(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades`, {name}, cfg)
  return resp.data
}

export async function deleteGrade(school, grade, cfg) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}`, cfg)
  return resp.data
}

export async function createClass(school, grade, name, cfg) {
  const resp = await axios.post(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}/classes`, {name}, cfg)
  return resp.data
}

export async function deleteClass(school, grade, className, cfg) {
  const resp = await axios.delete(`${APISRV}/web/schools/${encodeURIComponent(school)}/grades/${encodeURIComponent(grade)}/classes/${encodeURIComponent(className)}`, cfg)
  return resp.data
}
