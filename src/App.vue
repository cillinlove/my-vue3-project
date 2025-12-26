<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const authStore = useAuthStore()
const route = useRoute()

// 判断当前是否在登录页面
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <div class="app-container">
    <!-- 仅在登录成功后显示左侧菜单 -->
    <Sidebar v-if="!isLoginPage && authStore.isAuthenticated" />
    
    <!-- 仅在非登录页面显示顶部菜单 -->
    <nav v-if="!isLoginPage" class="navbar">
      <div class="nav-item">
        <router-link to="/">首页</router-link>
      </div>
      <div class="nav-item">
        <router-link to="/products/manage">商品管理</router-link>
      </div>
      <div class="nav-item">
        <router-link to="/orders">订单管理</router-link>
      </div>
      <div class="nav-item">
        <router-link to="/sales">销售仪表盘</router-link>
      </div>
      <div class="nav-item">
        <router-link to="/about">关于</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background-color: var(--bg-secondary);
}

/* 当有侧边栏时，调整布局为左右结构 */
:deep(.sidebar) ~ .navbar,
:deep(.sidebar) ~ .main-content {
  margin-left: var(--sidebar-width);
}

/* 当侧边栏收起时，调整主内容区域边距 */
:deep(.sidebar.sidebar-collapsed) ~ .navbar,
:deep(.sidebar.sidebar-collapsed) ~ .main-content {
  margin-left: var(--sidebar-collapsed-width);
}

/* 确保 Element Plus 弹窗不受布局影响 */
.el-message-box__wrapper,
.el-dialog__wrapper,
.el-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
}

.navbar {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-2xl);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  height: var(--header-height);
  transition: margin-left var(--transition-normal);
}

.nav-item {
  margin-right: var(--spacing-xl);
  position: relative;
}

.nav-item a {
  text-decoration: none;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-item a:hover {
  color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.05);
}

.nav-item a.router-link-active {
  color: var(--primary-color);
  background-color: rgba(64, 158, 255, 0.1);
}

.main-content {
  flex: 1;
  padding: var(--spacing-xl);
  transition: margin-left var(--transition-normal);
}
</style>

