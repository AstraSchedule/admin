<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {NButton, NCard, NForm, NFormItem, NInput, NSpace, useMessage} from 'naive-ui'
import axios from 'axios'
import {APISRV} from '@/global.js'
import {getAuthHeaders, removeToken} from '@/auth.js'

const router = useRouter()
const message = useMessage()

const form = ref({old_password: '', new_password: '', confirm_password: ''})
const loading = ref(false)

async function handleChangePassword() {
  if (!form.value.old_password || !form.value.new_password) {
    message.warning('请填写完整')
    return
  }
  if (form.value.new_password.length < 6) {
    message.warning('新密码长度不能少于 6 位')
    return
  }
  if (form.value.new_password !== form.value.confirm_password) {
    message.warning('两次输入的新密码不一致')
    return
  }
  loading.value = true
  try {
    await axios.post(`${APISRV}/web/auth/change-password`, {
      old_password: form.value.old_password,
      new_password: form.value.new_password
    }, {headers: getAuthHeaders()})
    message.success('密码修改成功，请重新登录')
    removeToken()
    router.replace('/login')
  } catch (e) {
    const detail = e?.response?.data?.detail || '修改失败'
    message.error(detail)
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  removeToken()
  router.replace('/login')
}
</script>

<template>
  <div class="change-pwd-wrapper">
    <n-card title="修改密码" class="change-pwd-card">
      <n-space vertical size="large">
        <p style="color: var(--n-text-color-3); margin: 0;">首次登录需要修改密码</p>
        <n-form label-placement="left">
          <n-form-item label="旧密码">
            <n-input v-model:value="form.old_password" type="password" show-password-on="click" placeholder="请输入当前密码"/>
          </n-form-item>
          <n-form-item label="新密码">
            <n-input v-model:value="form.new_password" type="password" show-password-on="click" placeholder="至少 6 位" @keyup.enter="handleChangePassword"/>
          </n-form-item>
          <n-form-item label="确认密码">
            <n-input v-model:value="form.confirm_password" type="password" show-password-on="click" placeholder="再次输入新密码" @keyup.enter="handleChangePassword"/>
          </n-form-item>
        </n-form>
        <n-button type="primary" block :loading="loading" @click="handleChangePassword">确认修改</n-button>
        <n-button block @click="handleLogout">退出登录</n-button>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.change-pwd-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--n-color, #f5f5f5);
}
.change-pwd-card {
  width: 420px;
}
</style>
