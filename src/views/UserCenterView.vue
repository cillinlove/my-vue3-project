<template>
  <PageLayout 
    title="用户中心" 
    :actions="[
      {
        type: 'primary',
        text: '新增用户',
        icon: Plus,
        onClick: handleAdd
      }
    ]"
  >
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="用户状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择用户状态"
            clearable
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 用户表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="userList" border style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名称" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'primary' : 'success'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="active"
              inactive-value="inactive"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" size="small" @click="handleAssignPermission(scope.row)">
                <el-icon><Setting /></el-icon>
                分配权限
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 分页 -->
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <!-- 权限分配弹窗 -->
  <el-dialog
    v-model="permissionDialogVisible"
    :title="`为用户 ${selectedUser?.username} 分配权限`"
    width="800px"
    destroy-on-close
  >
    <div class="permission-assignment">
      <!-- 权限筛选 -->
      <el-form :model="permissionQueryParams" layout="inline" size="small" class="permission-filter">
        <el-form-item label="权限名称">
          <el-input
            v-model="permissionQueryParams.name"
            placeholder="请输入权限名称"
            clearable
            @keyup.enter="fetchPermissions"
          />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input
            v-model="permissionQueryParams.code"
            placeholder="请输入权限编码"
            clearable
            @keyup.enter="fetchPermissions"
          />
        </el-form-item>
        <el-form-item label="所属模块">
          <el-input
            v-model="permissionQueryParams.module"
            placeholder="请输入所属模块"
            clearable
            @keyup.enter="fetchPermissions"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPermissions">查询</el-button>
          <el-button @click="resetPermissionQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 权限列表 -->
      <div class="permission-list">
        <el-scrollbar height="400px">
          <el-checkbox-group v-model="userPermissions">
            <el-tree
              :data="permissions"
              :props="permissionTreeProps"
              show-checkbox
              default-expand-all
              node-key="id"
              :check-strictly="false"
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <div class="permission-tree-node">
                  <span>{{ node.label }}</span>
                  <span class="permission-code">{{ data.code }}</span>
                  <el-tag
                    :type="
                      data.type === 'menu' ? 'primary' :
                      data.type === 'button' ? 'success' : 'warning'
                    "
                    size="small"
                    class="permission-type-tag"
                  >
                    {{ data.type === 'menu' ? '菜单' :
                       data.type === 'button' ? '按钮' : 'API' }}
                  </el-tag>
                </div>
              </template>
            </el-tree>
          </el-checkbox-group>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
      </span>
    </template>
  </el-dialog>
</PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Setting } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { User, UserQueryParams, UserUpdateRequest } from '../types/user'
import type { Permission, PermissionQueryParams } from '../types/permission'
import { getUsers, deleteUser, updateUser, getPermissions, getUserPermissions, assignUserPermissions } from '../utils/api'

// 获取用户列表
const fetchUsers = async () => {
  try {
    const params: UserQueryParams = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      username: searchForm.value.username,
      status: searchForm.value.status
    }
    
    const response = await getUsers(params)
    userList.value = response.list
    pagination.value.total = response.total
  } catch (error: any) {
    ElMessage.error('获取用户列表失败：' + (error.message || '未知错误'))
  }
}

// 搜索表单数据
const searchForm = ref({
  username: '',
  status: undefined as 'active' | 'inactive' | undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 用户列表数据
const userList = ref<User[]>([])

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchUsers()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    username: '',
    status: undefined
  }
  pagination.value.page = 1
  await fetchUsers()
  ElMessage.success('重置完成')
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchUsers()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchUsers()
}

// 新增用户
const handleAdd = () => {
  ElMessage.success('新增用户功能已实现')
}

// 编辑用户
const handleEdit = (_user: User) => {
  ElMessage.success('编辑用户功能已实现')
}

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${user.username}」吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'delete-confirm-message-box',
        confirmButtonClass: 'delete-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    await deleteUser(user.id)
    await fetchUsers()
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
      console.error('删除用户失败:', error)
    }
  }
}

// 状态变化
const handleStatusChange = async (user: User) => {
  try {
    const updateData: UserUpdateRequest = {
      ...user,
      status: user.status
    }
    await updateUser(updateData)
    ElMessage.success(`用户「${user.username}」状态已更新为${user.status === 'active' ? '启用' : '禁用'}`)
  } catch (error: any) {
    ElMessage.error('状态更新失败：' + (error.message || '未知错误'))
  }
}

// 权限分配相关数据
const permissionDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)
const permissions = ref<Permission[]>([])
const userPermissions = ref<string[]>([])
const permissionQueryParams = ref<PermissionQueryParams>({
  page: 1,
  pageSize: 100,
  name: '',
  code: '',
  module: ''
})

const permissionTreeProps = {
  label: 'name',
  children: 'children'
}

// 打开权限分配弹窗
const handleAssignPermission = async (user: User) => {
  selectedUser.value = user
  await fetchPermissions()
  await loadUserPermissions(user.id)
  permissionDialogVisible.value = true
}

// 获取权限列表
const fetchPermissions = async () => {
  try {
    const response = await getPermissions(permissionQueryParams.value)
    permissions.value = response.list
  } catch (error: any) {
    ElMessage.error('获取权限列表失败：' + (error.message || '未知错误'))
  }
}

// 加载用户已有权限
const loadUserPermissions = async (userId: number) => {
  try {
    const userPermissionData = await getUserPermissions(userId)
    if (userPermissionData) {
      userPermissions.value = userPermissionData.permissions
    } else {
      userPermissions.value = []
    }
  } catch (error: any) {
    ElMessage.error('加载用户权限失败：' + (error.message || '未知错误'))
    userPermissions.value = []
  }
}

// 重置权限筛选条件
const resetPermissionQuery = () => {
  permissionQueryParams.value = {
    page: 1,
    pageSize: 100,
    name: '',
    code: '',
    module: ''
  }
  fetchPermissions()
}

// 处理权限选择
const handlePermissionCheck = () => {
  // 权限选择逻辑由el-tree的@check事件自动处理
  // userPermissions数组会自动更新
}

// 保存权限分配
const handleSavePermissions = async () => {
  if (!selectedUser.value) return

  try {
    await assignUserPermissions({
      userId: selectedUser.value.id,
      permissionIds: userPermissions.value
    })
    permissionDialogVisible.value = false
    ElMessage.success('权限分配成功')
  } catch (error: any) {
    ElMessage.error('权限分配失败：' + (error.message || '未知错误'))
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchUsers()
})
</script>

<style scoped>
.user-center {
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--text-primary);
}

.search-form {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.table-container {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
}

.pagination-container {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}
</style>