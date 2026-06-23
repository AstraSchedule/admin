<script setup>
import {h, ref} from 'vue'
import {
  NButton, NCard, NDataTable, NForm, NFormItem, NInput, NModal, NSelect, NSpace, NTag, useMessage
} from 'naive-ui'
import {useRequest} from 'vue-request'
import {listUsers, createUser, updateUser, deleteUser} from '@/api/auth.js'

const message = useMessage()

const roleOptions = [
  {label: '管理员', value: 'admin'},
  {label: '校读写', value: 'school_rw'},
  {label: '级读写', value: 'grade_rw'},
  {label: '班读写', value: 'class_rw'}
]

const roleLabelMap = {admin: '管理员', school_rw: '校读写', grade_rw: '级读写', class_rw: '班读写'}
const roleTypeMap = {admin: 'error', school_rw: 'warning', grade_rw: 'info', class_rw: 'success'}

const users = ref([])

const {loading: listLoading, run: fetchUsers} = useRequest(listUsers, {
  manual: false,
  onSuccess: (data) => { users.value = Array.isArray(data?.data) ? data.data : [] },
  onError: (e) => { message.error(e?.response?.data?.detail || '获取用户列表失败') }
})

const columns = [
  {title: 'ID', key: 'id', width: 60},
  {title: '用户名', key: 'username'},
  {
    title: '角色', key: 'role', width: 100,
    render(row) {
      return h(NTag, {type: roleTypeMap[row.role] || 'default', bordered: false}, {default: () => roleLabelMap[row.role] || row.role})
    }
  },
  {title: '作用域', key: 'scope'},
  {
    title: '需改密', key: 'must_change_pwd', width: 80,
    render(row) {
      return row.must_change_pwd ? h(NTag, {type: 'warning', bordered: false}, {default: () => '是'}) : h(NTag, {type: 'success', bordered: false}, {default: () => '否'})
    }
  },
  {
    title: '操作', key: 'actions', width: 160,
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {size: 'small', onClick: () => openEdit(row)}, {default: () => '编辑'}),
          h(NButton, {size: 'small', type: 'error', onClick: () => doDelete(row)}, {default: () => '删除'})
        ]
      })
    }
  }
]

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const form = ref({username: '', password: '', role: 'class_rw', scope: ''})

const {loading: saveLoading, run: runSave} = useRequest(
  () => {
    if (isEdit.value) {
      const payload = {username: form.value.username, role: form.value.role, scope: form.value.scope}
      if (form.value.password) payload.password = form.value.password
      return updateUser(editId.value, payload)
    }
    return createUser(form.value)
  },
  {
    manual: true,
    onSuccess: () => {
      message.success(isEdit.value ? '用户更新成功' : '用户创建成功')
      showModal.value = false
      fetchUsers()
    },
    onError: (e) => { message.error(e?.response?.data?.detail || '操作失败') }
  }
)

const {run: runDelete} = useRequest(
  (row) => deleteUser(row.id),
  {
    manual: true,
    onSuccess: () => { message.success('用户已删除'); fetchUsers() },
    onError: (e) => { message.error(e?.response?.data?.detail || '删除失败') }
  }
)

function openCreate() {
  isEdit.value = false
  editId.value = null
  form.value = {username: '', password: '', role: 'class_rw', scope: ''}
  showModal.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  form.value = {username: row.username, password: '', role: row.role, scope: row.scope || ''}
  showModal.value = true
}

function handleSave() {
  if (!isEdit.value && (!form.value.username || !form.value.password)) {
    message.warning('用户名和密码不能为空')
    return
  }
  runSave()
}

function doDelete(row) {
  runDelete(row)
}
</script>

<template>
  <n-card title="用户管理">
    <template #header-extra>
      <n-button type="primary" @click="openCreate">新增用户</n-button>
    </template>
    <n-data-table :columns="columns" :data="users" :loading="listLoading" :bordered="false"/>
  </n-card>

  <n-modal v-model:show="showModal" preset="dialog" :title="isEdit ? '编辑用户' : '新增用户'">
    <n-form label-placement="left">
      <n-form-item label="用户名">
        <n-input v-model:value="form.username" placeholder="用户名"/>
      </n-form-item>
      <n-form-item label="密码">
        <n-input v-model:value="form.password" type="password" show-password-on="click" :placeholder="isEdit ? '留空不修改' : '至少 6 位'"/>
      </n-form-item>
      <n-form-item label="角色">
        <n-select v-model:value="form.role" :options="roleOptions"/>
      </n-form-item>
      <n-form-item label="作用域">
        <n-input v-model:value="form.scope" placeholder="如：实验中学 或 实验中学/高一 或 实验中学/高一/1班"/>
      </n-form-item>
    </n-form>
    <template #action>
      <n-button :loading="saveLoading" type="primary" @click="handleSave">{{ isEdit ? '保存' : '创建' }}</n-button>
    </template>
  </n-modal>
</template>
