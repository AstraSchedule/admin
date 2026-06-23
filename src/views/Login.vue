<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {NButton, NCard, NForm, NFormItem, NInput, NSpace, useMessage} from 'naive-ui'
import axios from 'axios'
import {APISRV} from '@/global.js'
import {setToken} from '@/auth.js'

const router = useRouter()
const message = useMessage()

const form = ref({username: '', password: ''})
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    message.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const resp = await axios.post(`${APISRV}/web/auth/login`, form.value)
    const {token, must_change_pwd} = resp.data
    setToken(token)
    if (must_change_pwd) {
      message.warning('首次登录请修改密码')
      router.replace('/change-password')
    } else {
      router.replace('/')
    }
  } catch (e) {
    const detail = e?.response?.data?.detail || '登录失败'
    message.error(detail)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <n-card title="星程课表 - 登录" class="login-card">
      <n-space vertical size="large">
        <n-form label-placement="left">
          <n-form-item label="用户名">
            <n-input v-model:value="form.username" placeholder="请输入用户名" @keyup.enter="handleLogin"/>
          </n-form-item>
          <n-form-item label="密码">
            <n-input v-model:value="form.password" type="password" show-password-on="click" placeholder="请输入密码" @keyup.enter="handleLogin"/>
          </n-form-item>
        </n-form>
        <n-button type="primary" block :loading="loading" @click="handleLogin">登录</n-button>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--n-color, #f5f5f5);
}
.login-card {
  width: 400px;
}
</style>
