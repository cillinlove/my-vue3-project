<template>
  <PageLayout 
    title="客户中心" 
    :actions="[
      {
        type: 'primary',
        text: '新增客户',
        icon: Plus,
        onClick: handleAdd
      }
    ]"
  >
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入客户名称"
            clearable
            @keyup.enter="handleSearch"
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleSearch"
            style="width: 160px"
          />
        </el-form-item>
        
        <el-form-item label="客户等级">
          <el-select
            v-model="searchForm.level"
            placeholder="请选择等级"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="option in CustomerLevelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="客户状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in CustomerStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 客户表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="customerList" style="width: 100%" @selection-change="handleSelectionChange" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="客户ID" width="80" align="center" />
        <el-table-column prop="name" label="客户名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" align="center" />
        <el-table-column prop="company" label="公司" min-width="160" show-overflow-tooltip />
        <el-table-column label="等级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" size="small">
              {{ getLevelLabel(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalOrders" label="订单数" width="90" align="center" />
        <el-table-column prop="totalSpent" label="消费金额" width="110" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalSpent.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="150" align="center">
          <template #default="scope">
            <div class="tag-list" v-if="scope.row.tags && scope.row.tags.length > 0">
              <el-tag 
                v-for="tag in scope.row.tags.slice(0, 3)" 
                :key="tag" 
                size="small" 
                class="mr-1 mb-1"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="scope.row.tags.length > 3" size="small" type="info">
                +{{ scope.row.tags.length - 3 }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastOrderTime" label="最近订单" width="160" align="center">
          <template #default="scope">
            {{ scope.row.lastOrderTime ? formatDate(scope.row.lastOrderTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)" class="mr-2">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                :type="scope.row.status === 'active' ? 'warning' : 'success'" 
                size="small"
                @click="handleToggleStatus(scope.row)"
                class="mr-2"
              >
                <el-icon><Switch /></el-icon>
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 批量操作 -->
      <div v-if="selectedCustomers.length > 0" class="batch-actions">
        <span class="selected-count">已选择 {{ selectedCustomers.length }} 项</span>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑客户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑客户' : '新增客户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入客户名称" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="公司名称">
          <el-input v-model="formData.company" placeholder="请输入公司名称（选填）" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户等级" prop="level">
              <el-select v-model="formData.level" placeholder="请选择等级" style="width: 100%">
                <el-option
                  v-for="option in CustomerLevelOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option
                  v-for="option in CustomerStatusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="客户标签">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Switch } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import PageLayout from '../components/PageLayout.vue'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, deleteCustomers, toggleCustomerStatus } from '../utils/api'
import type { 
  Customer, 
  CustomerCreateRequest, 
  CustomerUpdateRequest, 
  CustomerQueryParams,
  CustomerLevel,
  CustomerStatus
} from '../types/customer'
import { CustomerLevelOptions, CustomerStatusOptions } from '../types/customer'

const customerList = ref<Customer[]>([])
const selectedCustomers = ref<Customer[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const searchForm = reactive<CustomerQueryParams>({
  name: '',
  email: '',
  phone: '',
  level: undefined,
  status: undefined,
  page: 1,
  pageSize: 10
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  level: 'regular' as const,
  status: 'active' as const,
  tags: [],
  notes: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '客户名称长度在 2 到 50 个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

const availableTags = ['VIP', '老客户', '新客户', '高价值', '潜力客户', '投诉过的', '企业客户', '个人客户']

const fetchData = async () => {
  try {
    const params: CustomerQueryParams = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const response = await getCustomers(params)
    customerList.value = response.list
    pagination.total = response.total
    pagination.page = response.page
    pagination.pageSize = response.pageSize
  } catch (error) {
    ElMessage.error('获取客户列表失败')
    console.error(error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.email = ''
  searchForm.phone = ''
  searchForm.level = undefined
  searchForm.status = undefined
  handleSearch()
}

const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}

const handlePageChange = () => {
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (customer: Customer) => {
  isEdit.value = true
  Object.assign(formData, {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company || '',
    address: customer.address,
    level: customer.level,
    status: customer.status,
    tags: [...customer.tags],
    notes: customer.notes || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (customer: Customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户 "${customer.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCustomer(customer.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedCustomers.value.length === 0) return
  
  try {
    const names = selectedCustomers.value.map((c: Customer) => c.name).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？${names} 将会被删除，此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedCustomers.value.map((c: Customer) => c.id)
    await deleteCustomers(ids)
    ElMessage.success('批量删除成功')
    selectedCustomers.value = []
    fetchData()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

const handleToggleStatus = async (customer: Customer) => {
  const newStatus: CustomerStatus = customer.status === 'active' ? 'blocked' : 'active'
  const actionText = customer.status === 'active' ? '禁用' : '启用'
  
  try {
    await toggleCustomerStatus(customer.id, newStatus)
    ElMessage.success(`${actionText}成功`)
    fetchData()
  } catch (error: any) {
    ElMessage.error(`${actionText}失败`)
    console.error(error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value && formData.id) {
      const updateData: CustomerUpdateRequest = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        level: formData.level as CustomerLevel,
        status: formData.status as CustomerStatus,
        tags: formData.tags,
        notes: formData.notes
      }
      await updateCustomer(updateData)
      ElMessage.success('更新成功')
    } else {
      const createData: CustomerCreateRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        level: formData.level as CustomerLevel,
        tags: formData.tags,
        notes: formData.notes
      }
      await createCustomer(createData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    level: 'regular',
    status: 'active',
    tags: [],
    notes: ''
  })
  formRef.value?.clearValidate()
}

const getLevelType = (level: CustomerLevel): string => {
  const option = CustomerLevelOptions.find((o) => o.value === level)
  return option?.color === '#409EFF' ? 'primary' : 
         option?.color === '#E6A23C' ? 'warning' : 
         option?.color === '#C0C4CC' ? 'info' : ''
}

const getLevelLabel = (level: CustomerLevel): string => {
  const option = CustomerLevelOptions.find((o) => o.value === level)
  return option?.label || level
}

const getStatusType = (status: CustomerStatus): string => {
  const option = CustomerStatusOptions.find((o) => o.value === status)
  return option?.type || ''
}

const getStatusLabel = (status: CustomerStatus): string => {
  const option = CustomerStatusOptions.find((o) => o.value === status)
  return option?.label || status
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}

.table-container {
  margin-bottom: 16px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}

.selected-count {
  color: #909399;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.image-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}

.image-count {
  color: #909399;
  font-size: 12px;
}

.no-image {
  color: #c0c4cc;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.mr-2 {
  margin-right: 8px;
}

.mr-1 {
  margin-right: 4px;
}

.mb-1 {
  margin-bottom: 4px;
}

.text-gray-400 {
  color: #c0c4cc;
}

:deep(.el-card) {
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
  padding-bottom: 16px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}
</style>
