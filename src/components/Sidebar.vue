<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElIcon } from 'element-plus'
import { ShoppingBag, Document, DataAnalysis, Menu, Fold, User, Ticket, DocumentCopy, ShoppingCart, Box, Grid, Ship, SwitchButton, Key, UserFilled } from '@element-plus/icons-vue'

// 控制侧边栏收起/展开状态
const isCollapsed = ref(false)

// 控制移动端侧边栏展开状态
const isMobileExpanded = ref(false)

// 切换侧边栏状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 切换移动端侧边栏展开状态
const toggleMobileExpanded = () => {
  isMobileExpanded.value = !isMobileExpanded.value
}

// 键盘导航支持
const handleKeyDown = (event: KeyboardEvent) => {
  const activeElement = event.target as HTMLElement
  
  // 如果当前不在侧边栏内，不处理
  if (!activeElement.closest('.sidebar')) {
    return
  }
  
  const menuItems = document.querySelectorAll('.menu-item') as NodeListOf<HTMLElement>
  const currentIndex = Array.from(menuItems).indexOf(activeElement)
  let newIndex = currentIndex
  
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      newIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
      break
    case 'ArrowDown':
      event.preventDefault()
      newIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (!isCollapsed.value) {
        toggleCollapse()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (isCollapsed.value) {
        toggleCollapse()
      }
      break
    case 'Home':
      event.preventDefault()
      newIndex = 0
      break
    case 'End':
      event.preventDefault()
      newIndex = menuItems.length - 1
      break
    case 'Escape':
      if (window.innerWidth <= 768 && isMobileExpanded.value) {
        toggleMobileExpanded()
      }
      break
  }
  
  if (newIndex !== currentIndex && menuItems[newIndex]) {
    menuItems[newIndex]?.focus()
  }
}

// 使用全局window对象的正确方式
const globalWindow = typeof window !== 'undefined' ? window : null

// 跟踪视口宽度的ref
const viewportWidth = ref(globalWindow ? globalWindow.innerWidth : 0)

// 监听窗口大小变化
if (globalWindow) {
  const handleResize = () => {
    viewportWidth.value = globalWindow.innerWidth
  }
  
  globalWindow.addEventListener('keydown', handleKeyDown)
  globalWindow.addEventListener('resize', handleResize)
  
  // 组件卸载时移除所有事件监听
  onUnmounted(() => {
    globalWindow.removeEventListener('keydown', handleKeyDown)
    globalWindow.removeEventListener('resize', handleResize)
  })
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 菜单数据（分组结构，含图标颜色）
const menuGroups = [
  {
    title: '系统管理',
    items: [
      { path: '/', name: 'Home', title: '首页', icon: DataAnalysis, color: '#409EFF' },
      { path: '/permission-management', name: 'PermissionManagement', title: '权限管理', icon: Key, color: '#F56C6C' }
    ]
  },
  {
    title: '商品管理',
    items: [
      { path: '/products/manage', name: 'ProductManage', title: '商品管理', icon: ShoppingBag, color: '#E6A23C' },
      { path: '/orders', name: 'OrderList', title: '订单管理', icon: Document, color: '#909399' }
    ]
  },
  {
    title: '用户与营销',
    items: [
      { path: '/user-center', name: 'UserCenter', title: '用户中心', icon: User, color: '#F56C6C' },
      { path: '/customers', name: 'CustomerCenter', title: '客户中心', icon: UserFilled, color: '#67C23A' },
      { path: '/promotion-center', name: 'PromotionCenter', title: '促销中心', icon: Ticket, color: '#C0C4CC' }
    ]
  },
  {
    title: '内容管理',
    items: [
      { path: '/content-management', name: 'ContentManagement', title: '内容管理', icon: DocumentCopy, color: '#722ED1' }
    ]
  },
  {
    title: '采购与物流',
    items: [
      { path: '/purchase-center', name: 'PurchaseCenter', title: '采购中心', icon: ShoppingCart, color: '#13C2C2' },
      { path: '/wms-warehouse', name: 'WmsWarehouse', title: 'WMS仓库管理', icon: Box, color: '#FA8C16' },
      { path: '/dispatch-center', name: 'DispatchCenter', title: '调度中心', icon: Grid, color: '#EB2F96' },
      { path: '/logistics-center', name: 'LogisticsCenter', title: '物流中心', icon: Ship, color: '#36CBCB' }
    ]
  }
]

// 判断菜单是否激活
const isActive = (path: string) => {
  return route.path === path
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div 
    class="sidebar-backdrop" 
    v-if="isMobileExpanded" 
    @click="toggleMobileExpanded"
    role="presentation"
    aria-hidden="true"
  ></div>
  
  <!-- 移动端汉堡菜单按钮 -->
  <button 
    class="mobile-menu-btn" 
    @click="toggleMobileExpanded" 
    title="菜单"
    v-if="viewportWidth <= 768"
    :aria-expanded="isMobileExpanded"
    aria-label="打开侧边栏菜单"
    tabindex="0"
  >
    <ElIcon aria-hidden="true"><Menu /></ElIcon>
  </button>
  
  <div 
    class="sidebar" 
    :class="{ 'sidebar-collapsed': isCollapsed, 'sidebar-expanded-mobile': isMobileExpanded }"
    role="complementary"
    aria-label="导航边栏"
  >
    <div class="sidebar-header">
      <div class="logo-container" v-if="!isCollapsed">
        <ElIcon class="system-icon" aria-hidden="true"><DataAnalysis /></ElIcon>
        <h3 class="sidebar-title" role="heading" aria-level="1">电商后台管理系统</h3>
      </div>
      <ElIcon v-else class="collapsed-logo" title="电商后台管理系统" aria-label="电商后台管理系统"><DataAnalysis /></ElIcon>
      <button 
          class="collapse-btn" 
          @click="toggleCollapse" 
          title="展开/收起菜单"
          :aria-expanded="!isCollapsed"
          :aria-label="isCollapsed ? '展开菜单' : '收起菜单'"
          tabindex="0"
        >
          <ElIcon v-if="isCollapsed" aria-hidden="true"><Menu /></ElIcon>
          <ElIcon v-else aria-hidden="true"><Fold /></ElIcon>
        </button>
    </div>
    <div class="sidebar-menu" role="navigation" aria-label="主菜单">
      <div v-for="group in menuGroups" :key="group.title" class="menu-group" role="group" :aria-labelledby="`group-${group.title}`">
        <div 
          v-if="!isCollapsed" 
          class="menu-group-title"
          :id="`group-${group.title}`"
          aria-hidden="false"
        >
          {{ group.title }}
        </div>
        <router-link 
            v-for="item in group.items" 
            :key="item.name"
            :to="item.path"
            class="menu-item"
            :class="{ 'menu-item-active': isActive(item.path) }"
            :title="isCollapsed ? item.title : ''"
            :aria-current="isActive(item.path) ? 'page' : undefined"
            :aria-labelledby="`menu-item-text-${item.name}`"
            tabindex="0"
          >
            <div class="menu-item-inner">
              <ElIcon class="menu-icon" :style="{ '--icon-color': item.color }">
                <component :is="item.icon" aria-hidden="true" />
              </ElIcon>
              <span 
                :id="`menu-item-text-${item.name}`" 
                class="menu-text" 
                v-if="!isCollapsed"
                aria-hidden="false"
              >{{ item.title }}</span>
            </div>
          </router-link>
      </div>
    </div>
    <div class="sidebar-footer">
      <button 
        @click="handleLogout" 
        class="logout-button" 
        :title="isCollapsed ? '退出登录' : ''"
        aria-label="退出登录"
        type="button"
        tabindex="0"
      >
        <ElIcon v-if="isCollapsed" class="logout-icon" aria-hidden="true"><SwitchButton /></ElIcon>
        <span v-if="!isCollapsed" aria-hidden="false">退出登录</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: linear-gradient(180deg, #001529 0%, #000c17 100%);
  color: var(--text-white);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
}

.sidebar.sidebar-collapsed {
  width: var(--sidebar-collapsed-width);
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.15);
}

/* 侧边栏展开/收起时的内容过渡 */
.sidebar-menu,
.sidebar-header,
.sidebar-footer {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.sidebar-collapsed .sidebar-header {
  padding: var(--spacing-lg) var(--spacing-sm);
  justify-content: center;
}

.sidebar.sidebar-collapsed .sidebar-footer {
  padding: var(--spacing-md) var(--spacing-sm);
}

.collapse-btn {
  position: absolute;
  right: -16px;
  top: 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--text-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  transition: all var(--transition-fast);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }
  100% {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  }
}

.collapse-btn:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.collapse-btn:active {
  transform: scale(0.95);
}

.collapsed-logo {
  font-size: 28px;
  color: var(--text-white);
  transition: all var(--transition-normal);
}

.collapsed-logo:hover {
  transform: scale(1.1);
  color: var(--primary-color);
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.system-icon {
  font-size: 28px;
  color: var(--primary-color);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sidebar-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-white);
  background: linear-gradient(135deg, var(--text-white), #66b1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-menu {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: var(--spacing-lg);
}

.menu-group-title {
  padding: var(--spacing-xs) var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-normal);
}

.menu-group-title:hover {
  color: rgba(255, 255, 255, 0.7);
}

.sidebar.sidebar-collapsed .menu-group {
  margin-bottom: var(--spacing-md);
}

/* 优化滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  transform: translateX(0);
}

.menu-item-inner {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  position: relative;
  overflow: hidden;
}

/* 菜单项悬停的微交互 */
.menu-item:hover .menu-item-inner {
  background: rgba(64, 158, 255, 0.15);
  color: var(--text-white);
  padding-left: calc(var(--spacing-lg) + var(--spacing-xs));
  transform: translateY(0);
}

/* 菜单项的淡入动画 */
.menu-item {
  animation: fadeInLeft 0.4s ease-out both;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 为不同菜单项设置不同的动画延迟 */
.menu-item:nth-child(1) { animation-delay: 0.05s; }
.menu-item:nth-child(2) { animation-delay: 0.1s; }
.menu-item:nth-child(3) { animation-delay: 0.15s; }
.menu-item:nth-child(4) { animation-delay: 0.2s; }
.menu-item:nth-child(5) { animation-delay: 0.25s; }
.menu-item:nth-child(6) { animation-delay: 0.3s; }
.menu-item:nth-child(7) { animation-delay: 0.35s; }
.menu-item:nth-child(8) { animation-delay: 0.4s; }
.menu-item:nth-child(9) { animation-delay: 0.45s; }
.menu-item:nth-child(10) { animation-delay: 0.5s; }

.menu-item-inner::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, var(--primary-color), var(--primary-hover));
  transition: height var(--transition-normal);
}

.menu-item:hover .menu-item-inner {
  background: rgba(64, 158, 255, 0.1);
  color: var(--text-white);
  padding-left: calc(var(--spacing-lg) + var(--spacing-xs));
}

.menu-item:hover .menu-item-inner::before {
  height: 100%;
}

.sidebar.sidebar-collapsed .menu-item {
  justify-content: center;
}

.sidebar.sidebar-collapsed .menu-item-inner {
  padding: var(--spacing-md) var(--spacing-sm);
  justify-content: center;
  border-radius: var(--radius-md);
  margin: 0 var(--spacing-sm);
}

.sidebar.sidebar-collapsed .menu-item:hover .menu-item-inner {
  padding-left: var(--spacing-sm);
  background: rgba(64, 158, 255, 0.2);
  transform: scale(1.05);
}

.menu-item-active .menu-item-inner {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(64, 158, 255, 0.15));
  color: var(--text-white);
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.4), 0 0 0 1px rgba(64, 158, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.menu-item-active .menu-item-inner::before {
  height: 100%;
  background: linear-gradient(180deg, var(--primary-color), var(--primary-hover));
}

.menu-item-active .menu-item-inner::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
}

.menu-item-active:hover .menu-item-inner::after {
  left: 100%;
}

/* 优化激活状态下的图标和文字 */
.menu-item-active .menu-icon {
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.6);
}

.menu-item-active .menu-text {
  font-weight: var(--font-weight-semibold);
  position: relative;
  z-index: 1;
}

/* 收起状态下的激活效果 */
.sidebar.sidebar-collapsed .menu-item-active .menu-item-inner {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.4), rgba(64, 158, 255, 0.2));
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
  transform: scale(1.1);
}

.menu-icon {
  margin-right: var(--spacing-md);
  font-size: var(--font-size-lg);
  width: 24px;
  text-align: center;
  transition: all var(--transition-normal);
  color: var(--icon-color, rgba(255, 255, 255, 0.8));
  position: relative;
  z-index: 1;
}

.menu-item:hover .menu-icon {
  color: var(--icon-color);
  transform: scale(1.2) rotate(5deg);
  filter: brightness(1.2);
}

.menu-item-active .menu-icon {
  color: var(--text-white);
  transform: scale(1.2);
  text-shadow: 0 0 12px var(--icon-color);
}

/* 收起状态下的图标效果 */
.sidebar.sidebar-collapsed .menu-icon {
  margin-right: 0;
  font-size: var(--font-size-xl);
}

.sidebar.sidebar-collapsed .menu-item:hover .menu-icon {
  transform: scale(1.3);
}

.sidebar.sidebar-collapsed .menu-item-active .menu-icon {
  transform: scale(1.3);
  text-shadow: 0 0 15px var(--icon-color);
}

.menu-text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  position: relative;
}

.menu-item:hover .menu-text {
  opacity: 1;
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.1);
}

.sidebar.sidebar-collapsed .sidebar-footer {
  padding: var(--spacing-md) var(--spacing-sm);
}

.logout-button {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--danger-color), #c82333);
  color: var(--text-white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

.logout-button:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.3);
  transform: translateY(-2px);
}

.logout-button:active {
  transform: translateY(0);
}

.sidebar.sidebar-collapsed .logout-button {
  font-size: var(--font-size-xs);
  padding: var(--spacing-sm) var(--spacing-md);
}

.logout-icon {
  font-size: var(--font-size-md);
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.5), rgba(255, 255, 255, 0.3));
  border-radius: var(--radius-lg);
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(64, 158, 255, 0.7), rgba(255, 255, 255, 0.5));
}

/* 移动端汉堡菜单按钮 */
.mobile-menu-btn {
  position: fixed;
  top: var(--spacing-md);
  left: var(--spacing-md);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: var(--text-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  transition: all var(--transition-normal);
  z-index: 1000;
  font-size: var(--font-size-xl);
}

.mobile-menu-btn:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* 移动端遮罩层 */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 100;
    width: 100%;
    max-width: 320px;
  }
  
  .sidebar.sidebar-expanded-mobile {
    transform: translateX(0);
  }
  
  /* 移动端显示菜单分组标题 */
  .menu-group-title {
    display: block !important;
  }
  
  /* 移动端优化菜单项间距 */
  .menu-group {
    margin-bottom: var(--spacing-md);
  }
  
  .collapse-btn {
    display: none;
  }
  
  /* 移动端展开时，不允许菜单折叠 */
  .sidebar.sidebar-expanded-mobile .menu-item-inner {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  /* 移动端优化触摸目标大小 */
  .menu-item {
    min-height: 48px;
  }
  
  /* 移动端优化标题可见性 */
  .menu-group-title {
    font-size: var(--font-size-sm);
  }
  
  /* 移动端优化退出按钮 */
  .logout-button {
    height: 48px;
    font-size: var(--font-size-sm);
  }
  
  /* 移动端触摸反馈优化 */
  .menu-item:active .menu-item-inner,
  .logout-button:active {
    transform: scale(0.95);
  }
  
  /* 移动端优化滚动体验 */
  .sidebar-menu {
    scrollbar-width: thin;
    scrollbar-color: rgba(64, 158, 255, 0.5) rgba(0, 0, 0, 0.1);
  }
  
  /* 移动端优化菜单分组标题 */
  .menu-group-title {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-weight: var(--font-weight-semibold);
    color: rgba(255, 255, 255, 0.8);
  }
  
  /* 移动端优化菜单项动画 */
  .menu-item {
    animation-delay: 0s !important;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    --sidebar-width: 200px;
  }
  
  .menu-item-inner {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .menu-text {
    font-size: var(--font-size-sm);
  }
  
  .menu-icon {
    margin-right: var(--spacing-sm);
  }
}

/* 键盘焦点样式 */
.menu-item:focus,
.collapse-btn:focus,
.logout-button:focus,
.mobile-menu-btn:focus {
  outline: none;
}

.menu-item:focus .menu-item-inner {
  box-shadow: 0 0 0 2px var(--primary-color), 0 0 8px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(64, 158, 255, 0.15));
}

.collapse-btn:focus {
  box-shadow: 0 0 0 2px var(--text-white), 0 0 12px rgba(255, 255, 255, 0.6);
}

.logout-button:focus {
  box-shadow: 0 0 0 2px var(--text-white), 0 0 12px rgba(245, 108, 108, 0.6);
}

.mobile-menu-btn:focus {
  box-shadow: 0 0 0 2px var(--text-white), 0 0 12px rgba(64, 158, 255, 0.6);
}

/* 优化移动端键盘焦点管理 */
@media (max-width: 768px) {
  .menu-item:focus {
    position: relative;
    z-index: 2;
  }
}
</style>