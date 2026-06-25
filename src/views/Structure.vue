<script setup>
import {ref, computed} from 'vue'
import {
  NButton, NCard, NDataTable, NInput, NModal, NSpace, NTag, NTabs, NTabPane, useMessage, NPopconfirm
} from 'naive-ui'
import {useRequest} from 'vue-request'
import {fetchScopeTree} from '@/api/autorun.js'
import {createSchool, deleteSchool, createGrade, deleteGrade, createClass, deleteClass} from '@/api/structure.js'
import {verifyPassword} from '@/api/auth.js'

const message = useMessage()

const scopeTree = ref([])
const {run: refreshTree} = useRequest(fetchScopeTree, {
  manual: true,
  onSuccess: (res) => { scopeTree.value = res?.data || [] },
  onError: () => { scopeTree.value = [] }
})
refreshTree()

const showCreateModal = ref(false)
const createType = ref('school')
const createParent = ref('')
const createName = ref('')
const createLoading = ref(false)
const pwdModalShow = ref(false)
const pwdModalLoading = ref(false)
const pendingAction = ref(null)

function openCreateSchool() {
  createType.value = 'school'
  createParent.value = ''
  createName.value = ''
  showCreateModal.value = true
}

function openCreateGrade(school) {
  createType.value = 'grade'
  createParent.value = school
  createName.value = ''
  showCreateModal.value = true
}

function openCreateClass(school, grade) {
  createType.value = 'class'
  createParent.value = `${school}/${grade}`
  createName.value = ''
  showCreateModal.value = true
}

function doCreate() {
  if (!createName.value.trim()) {
    message.warning('名称不能为空')
    return
  }
  pendingAction.value = () => {
    createLoading.value = true
    const p = createParent.value
    let promise
    if (createType.value === 'school') promise = createSchool(createName.value)
    else if (createType.value === 'grade') promise = createGrade(p, createName.value)
    else promise = createClass(p.split('/')[0], p.split('/')[1], createName.value)
    promise
      .then(() => { message.success('创建成功'); showCreateModal.value = false; refreshTree() })
      .catch((e) => { message.error(e?.response?.data?.detail || '创建失败') })
      .finally(() => { createLoading.value = false })
  }
  pwdModalShow.value = true
}

function onPwdConfirm(password) {
  pwdModalLoading.value = true
  verifyPassword(password)
    .then(() => pendingAction.value?.())
    .catch(() => { message.error('你寻思寻思这密码它对吗？') })
    .finally(() => { pwdModalLoading.value = false; pwdModalShow.value = false })
}

function handleDelete(type, school, grade, cls) {
  pendingAction.value = () => {
    let promise
    if (type === 'school') promise = deleteSchool(school)
    else if (type === 'grade') promise = deleteGrade(school, grade)
    else promise = deleteClass(school, grade, cls)
    promise
      .then(() => { message.success('删除成功'); refreshTree() })
      .catch((e) => { message.error(e?.response?.data?.detail || '删除失败') })
  }
  pwdModalShow.value = true
}

const schoolColumns = [
  {title: '学校', key: 'school'},
  {
    title: '操作', key: 'actions', width: 260,
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {size: 'small', onClick: () => openCreateGrade(row.label)}, {default: () => '新增年级'}),
          h(NButton, {size: 'small', type: 'error', onClick: () => handleDelete('school', row.label)}, {default: () => '删除学校'})
        ]
      })
    }
  }
]

const gradeColumns = [
  {title: '年级', key: 'grade'},
  {
    title: '操作', key: 'actions', width: 260,
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {size: 'small', onClick: () => openCreateClass(row._school, row.label)}, {default: () => '新增班级'}),
          h(NButton, {size: 'small', type: 'error', onClick: () => handleDelete('grade', row._school, row.label)}, {default: () => '删除年级'})
        ]
      })
    }
  }
]

const classColumns = [
  {title: '班级', key: 'cls'},
  {
    title: '操作', key: 'actions', width: 160,
    render(row) {
      return h(NButton, {size: 'small', type: 'error', onClick: () => handleDelete('class', row._school, row._grade, row.label)}, {default: () => '删除班级'})
    }
  }
]

const schoolData = computed(() => scopeTree.value.map(s => ({...s, school: s.label})))
const selectedSchool = ref('')
const gradeData = computed(() => {
  if (!selectedSchool.value) return []
  const school = scopeTree.value.find(s => s.label === selectedSchool.value)
  return (school?.children || []).map(g => ({...g, _school: selectedSchool.value, grade: g.label}))
})
const selectedGrade = ref('')
const classData = computed(() => {
  if (!selectedSchool.value || !selectedGrade.value) return []
  const school = scopeTree.value.find(s => s.label === selectedSchool.value)
  const grade = school?.children?.find(g => g.label === selectedGrade.value)
  return (grade?.children || []).map(c => ({...c, _school: selectedSchool.value, _grade: selectedGrade.value, cls: c.label}))
})
</script>

<template>
  <n-card title="结构管理">
    <n-tabs type="line" v-model:value="selectedSchool">
      <n-tab v-for="s in schoolData" :key="s.label" :name="s.label">
        {{ s.label }}
        <template #tab>
          <n-space align="center" :size="4">
            {{ s.label }}
            <n-button size="tiny" quaternary @click.stop="openCreateGrade(s.label)">+</n-button>
          </n-space>
        </template>
      </n-tab>
      <template #suffix>
        <n-button size="small" @click="openCreateSchool">新增学校</n-button>
      </template>
    </n-tabs>

    <div v-if="selectedSchool" style="margin-top: 16px;">
      <n-tabs type="segment" v-model:value="selectedGrade" size="small">
        <n-tab v-for="g in gradeData" :key="g.label" :name="g.label">
          <n-space align="center" :size="4">
            {{ g.label }}
            <n-button size="tiny" quaternary @click.stop="openCreateClass(selectedSchool, g.label)">+</n-button>
            <n-button size="tiny" quaternary type="error" @click.stop="handleDelete('grade', selectedSchool, g.label)">×</n-button>
          </n-space>
        </n-tab>
      </n-tabs>

      <div v-if="selectedGrade" style="margin-top: 12px;">
        <n-data-table :columns="classColumns" :data="classData" :bordered="false" size="small"/>
      </div>
    </div>
  </n-card>

  <n-modal v-model:show="showCreateModal" preset="dialog"
    :title="createType === 'school' ? '新增学校' : createType === 'grade' ? '新增年级' : '新增班级'">
    <n-form label-placement="left">
      <n-form-item :label="createType === 'school' ? '学校名称' : createType === 'grade' ? '年级名称' : '班级名称'">
        <n-input v-model:value="createName" :placeholder="createType === 'school' ? '例如：实验中学' : createType === 'grade' ? '例如：高一' : '例如：1班'" @keyup.enter="doCreate"/>
      </n-form-item>
    </n-form>
    <template #action>
      <n-button :loading="createLoading" type="primary" @click="doCreate">创建</n-button>
    </template>
  </n-modal>

  <n-modal v-model:show="pwdModalShow" preset="dialog" title="验证身份">
    <n-space vertical>
      <div style="color: var(--n-text-color-3);">此操作需要密码确认</div>
      <n-input v-model:value="pwdInput" type="password" show-password-on="click" placeholder="输入密码" @keyup.enter="onPwdConfirm(pwdInput)"/>
    </n-space>
    <template #action>
      <n-button :loading="pwdModalLoading" type="primary" @click="onPwdConfirm(pwdInput)">确认</n-button>
    </template>
  </n-modal>
</template>

<script>
import {ref} from 'vue'
import {h} from 'vue'
export default {
  setup() {
    const pwdInput = ref('')
    return {pwdInput}
  }
}
</script>
