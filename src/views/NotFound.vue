<script setup>
import { NResult, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
document.title = "404 - 一片荒无人烟的地方，像是异世界"
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <n-result status="404" title="404 资源不存在" description="生活总归带点荒谬">
        <template #footer>
          <div class="error-contact">
            遇到问题？联系
            <a href="mailto:kuohu@getastra.cn">kuohu@getastra.cn</a>
          </div>
          <n-button type="primary" size="large" @click="router.push('/')">
            返回首页
          </n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<style scoped>
.not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
    padding: 24px;
}

.not-found-content {
    text-align: center;
}

.error-contact {
    font-size: 13px;
    opacity: 0.5;
    margin-bottom: 16px;
}

.error-contact a {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: currentColor;
    text-underline-offset: 2px;
}

.error-contact a:hover {
    opacity: 0.8;
}
</style>
