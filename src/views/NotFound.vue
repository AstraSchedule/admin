<script setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
document.title = "404 - 一片荒无人烟的地方，像是异世界"
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面走丢了</h1>
      <p class="error-desc">生活总归带点荒谬，这个页面大概也是</p>
      <div class="error-divider"></div>
      <p class="error-contact">
        遇到问题？联系
        <a href="mailto:kuohu@getastra.cn">kuohu@getastra.cn</a>
      </p>
      <n-button type="primary" size="large" @click="router.push('/')">
        返回首页
      </n-button>
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
    max-width: 400px;
}

.error-code {
    font-size: 96px;
    font-weight: 700;
    line-height: 1;
    opacity: 0.15;
    margin-bottom: -20px;
    user-select: none;
}

.error-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px;
}

.error-desc {
    font-size: 14px;
    opacity: 0.6;
    margin: 0 0 24px;
}

.error-divider {
    width: 40px;
    height: 2px;
    background: currentColor;
    opacity: 0.2;
    margin: 0 auto 24px;
}

.error-contact {
    font-size: 13px;
    opacity: 0.5;
    margin: 0 0 24px;
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
