<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {NButton, NCard, NForm, NFormItem, NInput, NSpace, useMessage} from 'naive-ui'
import {useRequest} from 'vue-request'
import {login} from '@/api/auth.js'
import {setToken} from '@/auth.js'

const router = useRouter()
const message = useMessage()

const form = ref({username: '', password: ''})

const {loading, run} = useRequest(() => login(form.value.username, form.value.password), {
  manual: true,
  onSuccess: (data) => {
    setToken(data.token)
    if (data.must_change_pwd) {
      message.warning('首次登录请修改密码')
      router.replace('/change-password')
    } else {
      router.replace('/')
    }
  },
  onError: (e) => {
    message.error(e?.response?.data?.detail || '登录失败')
  }
})

function handleLogin() {
  if (!form.value.username || !form.value.password) {
    message.warning('请输入用户名和密码')
    return
  }
  run()
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
