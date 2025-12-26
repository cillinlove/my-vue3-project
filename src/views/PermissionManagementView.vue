<template>
  <div class="permission-management">
    <div class="permission-management-header">
      <h2>权限管理</h2>
      <el-button type="primary" @click="handleAddPermission">
        <el-icon><Plus /></el-icon>
        新增权限
      </el-button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="permission-management-filter">
      <el-card shadow="hover">
        <el-form :model="queryParams" layout="inline" size="small">
          <el-form-item label="权限名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入权限名称"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="权限编码">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入权限编码"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="所属模块">
            <el-input
              v-model="queryParams.module"
              placeholder="请输入所属模块"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="权限类型">
            <el-select v-model="queryParams.type" placeholder="请选择权限类型" clearable>
              <el-option label="菜单" value="menu" />
              <el-option label="按钮" value="button" />
              <el-option label="API" value="api" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="queryParams.status" inline-prompt active-text="启用" inactive-text="禁用" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 权限列表 -->
    <div class="permission-management-table">
      <el-card shadow="hover">
        <el-table
          v-loading="loading"
          :data="permissions"
          style="width: 100%"
          stripe
          border
          :default-sort="{ prop: 'sort', order: 'ascending' }"
        >
          <el-table-column prop="name" label="权限名称" width="180" />
          <el-table-column prop="code" label="权限编码" width="180" />
          <el-table-column prop="module" label="所属模块" width="150" />
          <el-table-column prop="type" label="权限类型" width="120">
            <template #default="scope">
              <el-tag
                :type="
                  scope.row.type === 'menu' ? 'primary' :
                  scope.row.type === 'button' ? 'success' : 'warning'
                "
              >
                {{ scope.row.type === 'menu' ? '菜单' :
                   scope.row.type === 'button' ? '按钮' : 'API' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="访问路径" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="sort" label="排序" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column prop="updatedAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleEditPermission(scope.row)"
                :disabled="!scope.row.status"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeletePermission(scope.row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑权限弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增权限' : '编辑权限'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-position="top"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>

        <el-form-item label="所属模块" prop="module">
          <el-input v-model="permissionForm.module" placeholder="请输入所属模块" />
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>

        <el-form-item label="访问路径" prop="path">
          <el-input v-model="permissionForm.path" placeholder="请输入访问路径（菜单类型必填）" />
        </el-form-item>

        <el-form-item label="父权限" prop="parentId">
          <el-select v-model="permissionForm.parentId" placeholder="请选择父权限">
            <el-option value="" label="无父权限" />
            <el-option
              v-for="permission in parentPermissionOptions"
              :key="permission.id"
              :label="permission.name"
              :value="permission.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            placeholder="请输入权限描述"
            rows="3"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="permissionForm.sort"
            :min="1"
            :max="999"
            placeholder="请输入排序值"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch v-model="permissionForm.status" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionQueryParams
} from '../types/permission'
import { getPermissions, createPermission, updatePermission, deletePermission, togglePermissionStatus } from '../utils/api'

// 表格数据和加载状态
const permissions = ref<Permission[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive<PermissionQueryParams>({
  name: '',
  code: '',
  module: '',
  type: undefined,
  status: undefined,
  page: 1,
  pageSize: 10
})

// 弹窗状态
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')

// 表单引用和数据
const permissionFormRef = ref<FormInstance>()
const permissionForm = reactive<CreatePermissionRequest | UpdatePermissionRequest>({
  name: '',
  code: '',
  description: '',
  module: '',
  type: 'menu',
  path: '',
  parentId: '',
  sort: 1,
  status: true
})

// 表单验证规则
const permissionFormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 1, max: 50, message: '权限名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 1, max: 50, message: '权限编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  module: [
    { required: true, message: '请输入所属模块', trigger: 'blur' },
    { min: 1, max: 50, message: '所属模块长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    {
      required: (() => permissionForm.type === 'menu'),
      message: '菜单类型必须输入访问路径',
      trigger: 'blur'
    }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 父权限选项（排除当前编辑的权限）
const parentPermissionOptions = computed(() => {
  return permissions.value.filter(permission => {
    if (dialogType.value === 'edit' && permission.id === (permissionForm as any).id) {
      return false
    }
    return permission.type === 'menu' && permission.status
  })
})

// 获取权限列表
const fetchPermissions = async () => {
  loading.value = true
  try {
    const response = await getPermissions(queryParams)
    permissions.value = response.list
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询权限
const handleQuery = () => {
  queryParams.page = 1
  fetchPermissions()
}

// 重置查询参数
const handleReset = () => {
  Object.assign(queryParams, {
    name: '',
    code: '',
    module: '',
    type: undefined,
    status: undefined,
    page: 1,
    pageSize: 10
  })
  fetchPermissions()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  fetchPermissions()
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchPermissions()
}

// 打开新增权限弹窗
const handleAddPermission = () => {
  dialogType.value = 'create'
  // 重置表单
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  // 设置默认值
  Object.assign(permissionForm, {
    name: '',
    code: '',
    description: '',
    module: '',
    type: 'menu',
    path: '',
    parentId: '',
    sort: 1,
    status: true
  })
  dialogVisible.value = true
}

// 打开编辑权限弹窗
const handleEditPermission = (permission: Permission) => {
  dialogType.value = 'edit'
  // 填充表单数据
  Object.assign(permissionForm, {
    id: permission.id,
    name: permission.name,
    code: permission.code,
    description: permission.description,
    module: permission.module,
    type: permission.type,
    path: permission.path || '',
    parentId: permission.parentId || '',
    sort: permission.sort,
    status: permission.status
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return

  try {
    await permissionFormRef.value.validate()
    
    if (dialogType.value === 'create') {
      await createPermission(permissionForm as CreatePermissionRequest)
      ElMessage.success('新增权限成功')
    } else {
      await updatePermission((permissionForm as any).id, permissionForm as UpdatePermissionRequest)
      ElMessage.success('编辑权限成功')
    }
    
    dialogVisible.value = false
    fetchPermissions()
  } catch (error) {
    ElMessage.error(dialogType.value === 'create' ? '新增权限失败' : '编辑权限失败')
    console.error(dialogType.value === 'create' ? '新增权限失败:' : '编辑权限失败:', error)
  }
}

// 删除权限
const handleDeletePermission = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限「${permission.name}」吗？此操作不可撤销。`,
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
    
    await deletePermission(permission.id)
    ElMessage.success('删除权限成功')
    fetchPermissions()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除权限失败')
      console.error('删除权限失败:', error)
    }
  }
}

// 切换权限状态
const handleStatusChange = async (permission: Permission) => {
  try {
    await togglePermissionStatus(permission.id, permission.status)
    ElMessage.success('权限状态切换成功')
  } catch (error) {
    // 失败时恢复原状态
    permission.status = !permission.status
    ElMessage.error('权限状态切换失败')
    console.error('权限状态切换失败:', error)
  }
}

// 组件挂载时获取权限列表
onMounted(() => {
  fetchPermissions()
})
</script>

<style scoped>
.permission-management {
  padding: 20px;
}

.permission-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.permission-management-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.permission-management-filter {
  margin-bottom: 20px;
}

.permission-management-table {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}



:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
