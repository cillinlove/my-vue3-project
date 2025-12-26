<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 页面布局组件属性
const props = withDefaults(defineProps<{
  // 页面标题
  title: string
  // 是否显示返回按钮
  showBack?: boolean
  // 操作按钮配置
  actions?: Array<{
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    text: string
    icon?: any
    onClick: () => void
  }>
  // 是否显示刷新按钮
  showRefresh?: boolean
  // 刷新按钮点击事件
  onRefresh?: () => void
}>(), {
  showBack: false,
  actions: () => [],
  showRefresh: false
})
</script>

<template>
  <div class="page-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <!-- 返回按钮 -->
        <button 
          v-if="showBack" 
          class="back-button" 
          @click="$router.back()"
          aria-label="返回"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <!-- 页面标题 -->
        <h1 class="page-title">{{ title }}</h1>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <!-- 刷新按钮 -->
        <button 
          v-if="showRefresh && onRefresh" 
          class="refresh-button"
          @click="onRefresh"
          aria-label="刷新"
        >
          <ElIcon aria-hidden="true"><Refresh /></ElIcon>
          <span>刷新</span>
        </button>
        
        <!-- 自定义操作按钮 -->
        <el-button 
          v-for="(action, index) in actions" 
          :key="index"
          :type="action.type || 'primary'"
          :icon="action.icon"
          @click="action.onClick"
        >
          {{ action.text }}
        </el-button>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.back-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.back-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
  transform: translateX(-2px);
  color: var(--primary-color);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
  scrollbar-width: thin;
}

/* 自定义滚动条样式 */
.action-buttons::-webkit-scrollbar {
  height: 4px;
}

.action-buttons::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 2px;
}

.action-buttons::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 2px;
}

/* 确保按钮在小屏幕上可以正确换行 */
@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 100%;
  }
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.refresh-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.refresh-button:active {
  transform: translateY(0);
}

.page-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .page-title {
    font-size: var(--font-size-lg);
  }
  
  .page-content {
    padding: var(--spacing-md);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .page-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .page-content {
    padding: var(--spacing-lg);
  }
}
</style>