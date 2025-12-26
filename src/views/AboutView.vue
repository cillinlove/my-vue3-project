<template>
  <PageLayout title="关于系统">
    <div class="about-content">
      <p>这是一个基于 Vue 3 + TypeScript 开发的电商后台管理系统</p>
      <ul>
        <li>使用 Vite 5 构建</li>
        <li>Pinia 状态管理</li>
        <li>Vue Router 4 路由</li>
        <li>Element Plus 组件库</li>
        <li>ESLint + Prettier 代码规范</li>
      </ul>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import PageLayout from '../components/PageLayout.vue'
// AboutView 组件逻辑
</script>

<style scoped>
.about-content {
  ul {
    list-style: disc;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.5rem 0;
  }
}
</style>
