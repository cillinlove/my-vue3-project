<template>
  <PageLayout
    title="采购中心"
    :actions="[
      { type: 'primary', text: '新增采购订单', icon: Plus, onClick: handleAdd }
    ]"
  >
    <div class="purchase-center">
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单编号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="供应商">
          <el-input
            v-model="searchForm.supplierName"
            placeholder="请输入供应商名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择订单状态"
            clearable
          >
            <el-option label="待审批" value="pending" />
            <el-option label="已审批" value="approved" />
            <el-option label="已采购" value="purchased" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 采购订单列表表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="purchaseList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="supplierName" label="供应商" min-width="150" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
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

    <!-- 新增采购订单弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增采购订单"
      width="600px"
      :close-on-click-modal="false"
    >
      <ProcurementOrderForm
        ref="addFormRef"
        :is-edit="false"
        @update:form-data="handleAddFormDataChange"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddDialog">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit" :loading="isSubmitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑采购订单弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑采购订单"
      width="600px"
      :close-on-click-modal="false"
    >
      <ProcurementOrderForm
        ref="editFormRef"
        :order="editingOrder"
        :is-edit="true"
        @update:form-data="handleEditFormDataChange"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditDialog">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit" :loading="isSubmitting">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import ProcurementOrderForm from '../components/ProcurementOrderForm.vue'
import type { ProcurementOrder, ProcurementQueryParams, ProcurementCreateRequest, ProcurementUpdateRequest } from '../types/procurement'
import { getProcurements, deleteProcurement, createProcurement, updateProcurement } from '../utils/api'

// 搜索表单数据
const searchForm = ref({
  orderNo: '',
  supplierName: '',
  status: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 采购订单列表数据
const purchaseList = ref<ProcurementOrder[]>([])

// 新增弹窗相关
const addDialogVisible = ref(false)
const addFormRef = ref<InstanceType<typeof ProcurementOrderForm> | null>(null)
const addFormData = ref<ProcurementCreateRequest | null>(null)
const isSubmitting = ref(false)

// 编辑弹窗相关
const editDialogVisible = ref(false)
const editFormRef = ref<InstanceType<typeof ProcurementOrderForm> | null>(null)
const editFormData = ref<ProcurementUpdateRequest | null>(null)
const editingOrder = ref<ProcurementOrder>()

// 关闭新增弹窗
const closeAddDialog = () => {
  addFormRef.value?.resetForm()
  addFormData.value = null
  addDialogVisible.value = false
}

// 关闭编辑弹窗
const closeEditDialog = () => {
  editFormRef.value?.resetForm()
  editFormData.value = null
  editingOrder.value = undefined
  editDialogVisible.value = false
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已审批',
    purchased: '已采购',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status: string): string => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'info',
    purchased: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
}

// 获取采购订单列表
const fetchProcurements = async () => {
  try {
    const params: ProcurementQueryParams = {
      orderNo: searchForm.value.orderNo,
      supplierName: searchForm.value.supplierName,
      status: searchForm.value.status,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    const response = await getProcurements(params)
    purchaseList.value = response.list
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error('获取采购订单失败')
  }
}

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchProcurements()
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    orderNo: '',
    supplierName: '',
    status: undefined
  }
  pagination.value.page = 1
  await fetchProcurements()
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchProcurements()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchProcurements()
}

// 新增采购订单
const handleAdd = () => {
  addDialogVisible.value = true
}

// 新增表单数据变化处理
const handleAddFormDataChange = (data: ProcurementCreateRequest | ProcurementUpdateRequest) => {
  addFormData.value = data as ProcurementCreateRequest
}

// 新增提交
const handleAddSubmit = async () => {
  if (!addFormRef.value) {
    ElMessage.error('表单组件未加载完成，请重试')
    return
  }
  
  const isValid = await addFormRef.value.validate()
  if (!isValid) return
  
  if (!addFormData.value) {
    ElMessage.warning('请填写完整的订单信息')
    return
  }
  
  isSubmitting.value = true
  try {
    await createProcurement(addFormData.value)
    ElMessage.success('新增采购订单成功')
    closeAddDialog()
    await fetchProcurements()
  } catch (error: any) {
    ElMessage.error('新增失败：' + (error.message || '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}

// 编辑采购订单
const handleEdit = (order: ProcurementOrder) => {
  editingOrder.value = order
  editDialogVisible.value = true
}

// 编辑表单数据变化处理
const handleEditFormDataChange = (data: ProcurementCreateRequest | ProcurementUpdateRequest) => {
  editFormData.value = data as ProcurementUpdateRequest
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) {
    ElMessage.error('表单组件未加载完成，请重试')
    return
  }
  
  const isValid = await editFormRef.value.validate()
  if (!isValid) return
  
  if (!editFormData.value) {
    ElMessage.warning('请填写完整的订单信息')
    return
  }
  
  isSubmitting.value = true
  try {
    await updateProcurement(editFormData.value)
    ElMessage.success('保存成功')
    closeEditDialog()
    await fetchProcurements()
  } catch (error: any) {
    ElMessage.error('保存失败：' + (error.message || '未知错误'))
  } finally {
    isSubmitting.value = false
  }
}

// 删除采购订单
const handleDelete = async (purchase: ProcurementOrder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除采购订单「${purchase.orderNo}」吗？此操作不可撤销。`,
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
    
    await deleteProcurement(purchase.id)
    ElMessage.success('删除成功')
    await fetchProcurements()
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 页面加载时获取采购订单列表
onMounted(async () => {
  await fetchProcurements()
})
</script>

<style scoped>
.purchase-center {
  padding: var(--spacing-xl);
}

.action-bar {
  margin-bottom: var(--spacing-md);
}

.search-form {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
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