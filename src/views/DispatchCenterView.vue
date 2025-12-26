<template>
  <PageLayout 
    title="调度中心" 
    :actions="[
      { type: 'primary', text: '创建调度任务', icon: Plus, onClick: handleAddTask },
      { type: 'info', text: '调度规则', icon: Document, onClick: handleViewRules },
      { type: 'success', text: '批量调度', icon: DataAnalysis, onClick: handleBatchDispatch }
    ]"
  >
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="任务编号">
          <el-input
            v-model="searchForm.taskNo"
            placeholder="请输入任务编号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="订单ID">
          <el-input
            v-model="searchForm.orderId"
            type="number"
            placeholder="请输入订单ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="任务状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择任务状态"
            clearable
          >
            <el-option label="待调度" value="pending" />
            <el-option label="调度中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择优先级"
            clearable
          >
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 调度任务列表 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="taskList" stripe style="width: 100%">
        <el-table-column prop="id" label="任务ID" width="120" align="center" />
        <el-table-column prop="taskNo" label="任务编号" width="180" />
        <el-table-column prop="orderId" label="订单ID" width="120" align="center" />
        <el-table-column prop="warehouseName" label="仓库" width="120" align="center" />
        <el-table-column prop="requiredQuantity" label="需求数量" width="120" align="center" />
        <el-table-column prop="dispatchedQuantity" label="已调度数量" width="120" align="center" />
        <el-table-column prop="priority" label="优先级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 'high' ? 'danger' : scope.row.priority === 'medium' ? 'warning' : 'success'">
              {{ scope.row.priority === 'high' ? '高' : scope.row.priority === 'medium' ? '中' : '低' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="
              scope.row.status === 'pending' ? 'info' : 
              scope.row.status === 'processing' ? 'warning' : 
              scope.row.status === 'completed' ? 'success' : 'danger'
            ">
              {{ 
                scope.row.status === 'pending' ? '待调度' : 
                scope.row.status === 'processing' ? '调度中' : 
                scope.row.status === 'completed' ? '已完成' : '失败'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="endTime" label="完成时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <div class="table-action-buttons">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row)" v-permission="'dispatch_view'">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button type="warning" size="small" @click="handleEditTask(scope.row)" v-permission="'dispatch_edit'">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" size="small" @click="handleExecuteTask(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'dispatch_execute'">
                <el-icon><Check /></el-icon>
                执行
              </el-button>
              <el-button type="danger" size="small" @click="handleCancelTask(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'dispatch_cancel'">
                <el-icon><Delete /></el-icon>
                取消
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
    
    <!-- 编辑调度任务对话框 -->
    <EditDialog
      v-model="editDialogVisible"
      title="编辑调度任务"
      :is-loading="isEditLoading"
      @confirm="confirmEditTask"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="任务编号" prop="taskNo">
          <el-input v-model="editForm.taskNo" disabled />
        </el-form-item>
        <el-form-item label="订单ID" prop="orderId">
          <el-input v-model="editForm.orderId" disabled />
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseName">
          <el-input v-model="editForm.warehouseName" disabled />
        </el-form-item>
        <el-form-item label="优先级" prop="priority" required>
          <el-select v-model="editForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="需求数量" prop="requiredQuantity" required>
          <el-input-number v-model="editForm.requiredQuantity" :min="1" :max="99999" />
        </el-form-item>
        <el-form-item label="已调度数量" prop="dispatchedQuantity">
          <el-input-number v-model="editForm.dispatchedQuantity" :min="0" :max="editForm.requiredQuantity" />
        </el-form-item>
        <el-form-item label="状态" prop="status" required>
          <el-select v-model="editForm.status" placeholder="请选择状态" clearable>
            <el-option label="待调度" value="pending" />
            <el-option label="调度中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="editForm.operator" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker 
            v-model="editForm.startTime" 
            type="datetime" 
            placeholder="请选择开始时间" 
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable 
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker 
            v-model="editForm.endTime" 
            type="datetime" 
            placeholder="请选择结束时间" 
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            clearable 
          />
        </el-form-item>
      </el-form>
    </EditDialog>

    <!-- 查看任务详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="调度任务详情"
      width="600px"
      :close-on-click-modal="true"
      :append-to-body="true"
    >
      <div class="task-detail-content">
        <div class="detail-row"><strong>任务编号：</strong>{{ currentTask?.taskNo }}</div>
        <div class="detail-row"><strong>订单ID：</strong>{{ currentTask?.orderId }}</div>
        <div class="detail-row"><strong>仓库：</strong>{{ currentTask?.warehouseName }}</div>
        <div class="detail-row">
          <strong>优先级：</strong>
          <el-tag :type="currentTask?.priority === 'high' ? 'danger' : currentTask?.priority === 'medium' ? 'warning' : 'success'">
            {{ currentTask?.priority === 'high' ? '高' : currentTask?.priority === 'medium' ? '中' : '低' }}
          </el-tag>
        </div>
        <div class="detail-row"><strong>需求数量：</strong>{{ currentTask?.requiredQuantity }}</div>
        <div class="detail-row"><strong>已调度数量：</strong>{{ currentTask?.dispatchedQuantity }}</div>
        <div class="detail-row">
          <strong>状态：</strong>
          <el-tag :type="
            currentTask?.status === 'completed' ? 'success' : 
            currentTask?.status === 'processing' ? 'warning' : 
            currentTask?.status === 'failed' ? 'danger' : 'info'
          ">
            {{
              currentTask?.status === 'pending' ? '待调度' : 
              currentTask?.status === 'processing' ? '调度中' : 
              currentTask?.status === 'completed' ? '已完成' : 
              currentTask?.status === 'failed' ? '失败' : '已取消'
            }}
          </el-tag>
        </div>
        <div class="detail-row" v-if="currentTask?.operator"><strong>操作人：</strong>{{ currentTask.operator }}</div>
        <div class="detail-row" v-if="currentTask?.startTime"><strong>开始时间：</strong>{{ currentTask.startTime }}</div>
        <div class="detail-row" v-if="currentTask?.endTime"><strong>完成时间：</strong>{{ currentTask.endTime }}</div>
        <div class="detail-row"><strong>创建时间：</strong>{{ currentTask?.createdAt }}</div>
        <div class="detail-row"><strong>更新时间：</strong>{{ currentTask?.updatedAt }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, DataAnalysis, View, Edit, Delete, Check } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { DispatchTask, DispatchQueryParams, DispatchCreateRequest, DispatchUpdateRequest } from '../types/dispatch'
import { getDispatches, createDispatch, updateDispatch, deleteDispatch } from '../utils/api'

// 搜索表单数据
const searchForm = ref({
  taskNo: '',
  orderId: undefined,
  status: undefined,
  priority: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 100
})

// 调度任务列表
const taskList = ref<DispatchTask[]>([])

// 编辑表单相关
const editDialogVisible = ref(false)
const editForm = ref({
  id: 0,
  taskNo: '',
  orderId: '',
  warehouseId: '',
  warehouseName: '',
  status: 'pending',
  priority: 'medium',
  requiredQuantity: 1,
  dispatchedQuantity: 0,
  operator: '',
  startTime: '',
  endTime: ''
})
// 表单引用，用于后续验证
const isEditLoading = ref(false)

// 查看详情相关
const detailDialogVisible = ref(false)
const currentTask = ref<DispatchTask | null>(null)

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchDispatchTasks()
}

// 获取调度任务列表
const fetchDispatchTasks = async () => {
  const params: DispatchQueryParams = {
    taskNo: searchForm.value.taskNo,
    orderId: searchForm.value.orderId,
    status: searchForm.value.status,
    priority: searchForm.value.priority,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  
  try {
    const response = await getDispatches(params)
    taskList.value = response.list
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error(`获取调度任务失败: ${(error as Error).message}`)
  }
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    taskNo: '',
    orderId: undefined,
    status: undefined,
    priority: undefined
  }
  pagination.value.page = 1
  await fetchDispatchTasks()
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchDispatchTasks()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchDispatchTasks()
}

// 创建调度任务
const handleAddTask = async () => {
  // 创建符合接口要求的模拟调度任务数据
  const newTask: DispatchCreateRequest = {
    orderId: Math.floor(Math.random() * 10000),
    warehouseId: 1,
    priority: 'medium',
    requiredQuantity: 10,
    items: [
      {
        productName: '测试商品',
        sku: 'TEST' + Date.now(),
        quantity: 10,
        location: 'A-1-1'
      }
    ]
  }
  
  try {
    await createDispatch(newTask)
    ElMessage.success('调度任务创建成功')
    await fetchDispatchTasks() // 刷新任务列表
  } catch (error) {
    ElMessage.error(`创建调度任务失败: ${(error as Error).message}`)
  }
}

// 查看调度规则
const handleViewRules = () => {
  ElMessage.info('查看调度规则功能开发中')
}

// 批量调度
const handleBatchDispatch = () => {
  ElMessage.info('批量调度功能开发中')
}

// 查看任务详情
const handleViewDetail = (task: DispatchTask) => {
  currentTask.value = task
  detailDialogVisible.value = true
}

// 编辑任务
const handleEditTask = (task: DispatchTask) => {
  // 初始化编辑表单数据
  editForm.value = {
    id: task.id,
    taskNo: task.taskNo,
    orderId: task.orderId.toString(),
    warehouseId: task.warehouseId.toString(),
    warehouseName: task.warehouseName,
    status: task.status,
    priority: task.priority,
    requiredQuantity: task.requiredQuantity,
    dispatchedQuantity: task.dispatchedQuantity,
    operator: task.operator || '',
    startTime: task.startTime || '',
    endTime: task.endTime || ''
  }
  editDialogVisible.value = true
}

// 确认编辑任务
const confirmEditTask = async () => {
  try {
    // 表单验证
    const requiredFields = ['orderId', 'warehouseId', 'priority', 'requiredQuantity']
    for (const field of requiredFields) {
      if (!editForm.value[field as keyof typeof editForm.value]) {
        ElMessage.warning(`请填写${field === 'orderId' ? '订单ID' : field === 'warehouseId' ? '仓库' : field === 'priority' ? '优先级' : '需求数量'}`)
        return
      }
    }

    // 验证数值字段
    if (parseInt(editForm.value.orderId) <= 0) {
      ElMessage.warning('订单ID必须为正整数')
      return
    }

    if (parseInt(editForm.value.warehouseId) <= 0) {
      ElMessage.warning('请选择有效仓库')
      return
    }

    if (editForm.value.requiredQuantity <= 0) {
      ElMessage.warning('需求数量必须大于0')
      return
    }

    // 创建更新请求数据
    const updateData: DispatchUpdateRequest = {
      id: editForm.value.id,
      orderId: parseInt(editForm.value.orderId),
      warehouseId: parseInt(editForm.value.warehouseId),
      status: editForm.value.status as DispatchUpdateRequest['status'],
      priority: editForm.value.priority as DispatchUpdateRequest['priority'],
      requiredQuantity: editForm.value.requiredQuantity,
      dispatchedQuantity: editForm.value.dispatchedQuantity,
      operator: editForm.value.operator,
      startTime: editForm.value.startTime || undefined,
      endTime: editForm.value.endTime || undefined
    }

    // 如果开始时间和结束时间格式不正确，清除它们
    if (updateData.startTime && !updateData.startTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      delete updateData.startTime
    }
    
    if (updateData.endTime && !updateData.endTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      delete updateData.endTime
    }

    // 调用API更新任务
    await updateDispatch(updateData)
    
    ElMessage.success('调度任务更新成功')
    editDialogVisible.value = false // 关闭对话框
    await fetchDispatchTasks() // 刷新任务列表
  } catch (error) {
    ElMessage.error(`更新调度任务失败: ${(error as Error).message}`)
    console.error('更新调度任务失败:', error)
  }
}

// 取消任务
const handleCancelTask = async (task: DispatchTask) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该调度任务吗？此操作不可撤销。',
      '取消任务确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留任务',
        type: 'warning',
        customClass: 'cancel-task-message-box',
        confirmButtonClass: 'cancel-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    await deleteDispatch(task.id)
    ElMessage.success('任务已取消')
    await fetchDispatchTasks()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(`取消调度任务失败: ${(error as Error).message}`)
      console.error('取消调度任务失败:', error)
    }
  }
}

// 执行任务
const handleExecuteTask = async (task: DispatchTask) => {
  // 创建符合接口要求的执行数据
  const executedTask: DispatchUpdateRequest = {
    id: task.id,
    status: 'completed',
    dispatchedQuantity: task.requiredQuantity || 0,
    endTime: new Date().toISOString()
  }
  
  try {
    await updateDispatch(executedTask)
    ElMessage.success('调度任务执行成功')
    await fetchDispatchTasks() // 刷新任务列表
  } catch (error) {
    ElMessage.error(`执行调度任务失败: ${(error as Error).message}`)
  }
}

// 初始化数据
onMounted(async () => {
  await fetchDispatchTasks()
})
</script>

<style scoped>
/* 搜索表单样式 */
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

/* 操作按钮容器 - 现代化设计 */
.table-action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  min-width: 280px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-action-buttons::-webkit-scrollbar {
  display: none;
}

/* 按钮样式优化 */
.table-action-buttons .el-button {
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.table-action-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-action-buttons .el-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 240px;
  }
  
  .table-action-buttons .el-button {
    padding: var(--spacing-xs);
    font-size: 12px;
  }
  
  .table-action-buttons .el-button .el-icon {
    font-size: 14px;
  }
}

/* 手机设备优化 */
@media (max-width: 768px) {
  .table-action-buttons {
    gap: var(--spacing-xs);
    min-width: 200px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .table-action-buttons .el-button {
    min-width: 60px;
    padding: var(--spacing-xs);
    font-size: 11px;
  }
}

/* 超小屏幕设备 */
@media (max-width: 480px) {
  .table-action-buttons {
    min-width: 180px;
    gap: 2px;
  }
  
  .table-action-buttons .el-button {
    min-width: 50px;
    padding: 2px 4px;
    font-size: 10px;
  }
}
</style>