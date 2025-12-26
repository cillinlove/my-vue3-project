<template>
  <div class="permission-demo">
    <div class="demo-header">
      <h1>权限系统演示页面</h1>
      <div class="user-info">
        <p><strong>用户名:</strong> {{ authStore.userInfo?.username }}</p>
        <p><strong>角色:</strong> {{ authStore.userInfo?.role }}</p>
        <p><strong>权限:</strong> {{ authStore.userInfo?.permissions?.join(', ') }}</p>
      </div>
    </div>

    <div class="demo-content">
      <!-- 1. 路由权限演示 -->
      <section class="demo-section">
        <h2>1. 路由权限演示</h2>
        <p>当前用户可以访问的菜单项：</p>
        <div class="menu-list">
          <el-tag 
            v-for="item in menuItems" 
            :key="item.id"
            class="menu-item"
            :type="getTagType(item.requiredPermissions?.[0] || 'dashboard_view')"
          >
            {{ item.title }}
          </el-tag>
        </div>
        <p class="note">* 只有具有相应权限的用户才能看到这些菜单项</p>
      </section>

      <!-- 2. v-permission指令演示 -->
      <section class="demo-section">
        <h2>2. v-permission自定义指令演示</h2>
        <p>根据权限显示/隐藏按钮：</p>
        
        <div class="button-group">
          <el-button 
            v-permission="'dashboard_view'" 
            type="primary"
            @click="showMessage('仪表盘查看权限')"
          >
            查看仪表盘
          </el-button>

          <el-button 
            v-permission="'product_create'" 
            type="success"
            @click="showMessage('商品创建权限')"
          >
            创建商品
          </el-button>

          <el-button 
            v-permission="'user_delete'" 
            type="danger"
            @click="showMessage('用户删除权限')"
          >
            删除用户
          </el-button>

          <el-button 
            v-permission="['product_view', 'product_edit']" 
            type="warning"
            @click="showMessage('商品查看+编辑权限')"
          >
            查看编辑商品
          </el-button>
        </div>

        <p class="note">* 只有具有相应权限的用户才能看到对应的按钮</p>
      </section>

      <!-- 3. 权限检查函数演示 -->
      <section class="demo-section">
        <h2>3. 权限检查函数演示</h2>
        <p>使用usePermission和useBatchPermission函数：</p>
        
        <div class="permission-check">
          <el-card class="permission-card">
            <template #header>
              <span>单个权限检查</span>
            </template>
            <div class="check-result">
              <p>dashboard_view: <el-tag :type="hasDashboard ? 'success' : 'danger'">{{ hasDashboard ? '有权限' : '无权限' }}</el-tag></p>
              <p>product_create: <el-tag :type="hasProductCreate ? 'success' : 'danger'">{{ hasProductCreate ? '有权限' : '无权限' }}</el-tag></p>
              <p>user_delete: <el-tag :type="hasUserDelete ? 'success' : 'danger'">{{ hasUserDelete ? '有权限' : '无权限' }}</el-tag></p>
            </div>
          </el-card>

          <el-card class="permission-card">
            <template #header>
              <span>批量权限检查</span>
            </template>
            <div class="check-result">
              <p>所有权限 [product_view, product_edit]: <el-tag :type="hasAll ? 'success' : 'danger'">{{ hasAll ? '有权限' : '无权限' }}</el-tag></p>
              <p>任一权限 [product_create, user_delete]: <el-tag :type="hasAny ? 'success' : 'danger'">{{ hasAny ? '有权限' : '无权限' }}</el-tag></p>
            </div>
          </el-card>
        </div>
      </section>

      <!-- 4. 管理员功能演示 -->
      <section class="demo-section">
        <h2>4. 管理员功能演示</h2>
        <p>只有管理员才能看到的内容：</p>
        <el-alert
          v-permission="'system_view'"
          title="管理员专用功能区域"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>这里只有拥有system_view权限的用户才能看到。</p>
        </el-alert>

        <div class="admin-buttons" v-permission="'system_view'">
          <el-button type="danger" @click="showMessage('系统设置功能')">系统设置</el-button>
          <el-button type="warning" @click="showMessage('用户管理功能')">用户管理</el-button>
          <el-button type="info" @click="showMessage('权限分配功能')">权限分配</el-button>
        </div>
      </section>

      <!-- 5. 测试403页面 -->
      <section class="demo-section">
        <h2>5. 权限测试</h2>
        <p>测试没有权限时的处理：</p>
        <el-button @click="testNoPermission">测试403页面</el-button>
        <p class="note">* 如果用户没有权限，路由守卫会自动跳转到403页面</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { usePermissionMenu } from '../composables/usePermissionMenu'
import { usePermission, useBatchPermission } from '../directives/permission'
import type { PermissionCode } from '../types/permission-system'

const router = useRouter()
const authStore = useAuthStore()
const { menuItems } = usePermissionMenu()

// 权限检查函数
const hasDashboard = usePermission('dashboard_view' as PermissionCode)
const hasProductCreate = usePermission('product_create' as PermissionCode)
const hasUserDelete = usePermission('user_delete' as PermissionCode)

// 批量权限检查
const batchChecker = useBatchPermission()
const hasAll = computed(() => batchChecker.hasAll(['product_view', 'product_edit'] as PermissionCode[]))
const hasAny = computed(() => batchChecker.hasAny(['product_create', 'user_delete'] as PermissionCode[]))

// 获取标签类型
const getTagType = (permission: string) => {
  const types: Record<string, string> = {
    'dashboard_view': 'primary',
    'product_view': 'success',
    'product_create': 'warning',
    'user_view': 'info',
    'user_delete': 'danger',
    'system_view': 'danger'
  }
  return types[permission] || 'default'
}

// 显示消息
const showMessage = (message: string) => {
  ElMessage.success(`您点击了: ${message}`)
}

// 测试403页面
const testNoPermission = () => {
  // 尝试访问一个需要特殊权限的页面
  router.push('/permission-management')
}
</script>

<style scoped>
.permission-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.demo-header h1 {
  margin: 0 0 20px 0;
  font-size: 28px;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin: 0 0 15px 0;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.menu-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.menu-item {
  margin: 0;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.permission-check {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 15px 0;
}

.permission-card {
  height: fit-content;
}

.check-result {
  line-height: 2;
}

.admin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.note {
  color: #909399;
  font-size: 14px;
  font-style: italic;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .permission-demo {
    padding: 10px;
  }
  
  .demo-header {
    padding: 20px;
  }
  
  .user-info {
    grid-template-columns: 1fr;
  }
  
  .button-group,
  .admin-buttons {
    flex-direction: column;
  }
  
  .permission-check {
    grid-template-columns: 1fr;
  }
}
</style>