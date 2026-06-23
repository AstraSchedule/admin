<script setup>
import { NResult, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
document.title = "404 - 一片荒无人烟的地方，像是异世界"
</script>

<template>
  <div class="not-found">
    <n-result status="404" title="404 资源不存在" description="生活总归带点荒谬">
      <template #footer>
        <div class="footer-content">
          <p>↓↓↓ 告诉"开发者" ↓↓↓</p>
          <p style="color: var(--text-tertiary);">kuohu@getastra.cn</p>
          <n-button type="primary" style="margin-top: 16px;" @click="router.push('/')">
            返回首页
          </n-button>
        </div>
      </template>
    </n-result>
  </div>
</template>

<style scoped>
.not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
}

.footer-content {
    text-align: center;
}
</style>
