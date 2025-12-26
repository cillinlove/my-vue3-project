<template>
  <PageLayout
    title="物流中心"
    :actions="[
      { type: 'primary', text: '创建物流单', icon: Plus, onClick: handleCreateShipment },
      { type: 'success', text: '批量发货', icon: Ship, onClick: handleBatchShip },
      { type: 'info', text: '物流商管理', icon: Document, onClick: handleViewCarriers },
      { type: 'warning', text: '异常追踪', icon: Warning, onClick: handleTrackException }
    ]"
  >
    <div class="logistics-center">
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="物流单号">
          <el-input
            v-model="searchForm.trackingNo"
            placeholder="请输入物流单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="物流状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择物流状态"
            clearable
          >
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="delivered" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="物流商">
          <el-select
            v-model="searchForm.carrier"
            placeholder="请选择物流商"
            clearable
          >
            <el-option label="顺丰速运" value="sf_express" />
            <el-option label="中通快递" value="zhongtong" />
            <el-option label="申通快递" value="shentong" />
            <el-option label="圆通快递" value="yuantong" />
            <el-option label="韵达快递" value="yunda" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 物流信息列表 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="logisticsList" stripe style="width: 100%">
        <el-table-column prop="trackingNo" label="物流单号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="carrier" label="物流商" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary">
              {{ scope.row.carrier === 'sf_express' ? '顺丰速运' : 
                 scope.row.carrier === 'zhongtong' ? '中通快递' : 
                 scope.row.carrier === 'shentong' ? '申通快递' : 
                 scope.row.carrier === 'yuantong' ? '圆通快递' : '韵达快递' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="物流状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="
              scope.row.status === 'pending' ? 'info' : 
              scope.row.status === 'shipped' ? 'warning' : 
              scope.row.status === 'in_transit' ? 'success' : 
              scope.row.status === 'delivered' ? 'success' : 'danger'
            ">
              {{ 
                scope.row.status === 'pending' ? '待发货' : 
                scope.row.status === 'shipped' ? '已发货' : 
                scope.row.status === 'in_transit' ? '运输中' : 
                scope.row.status === 'delivered' ? '已签收' : '异常'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipientName" label="收件人" width="120" />
        <el-table-column prop="recipientPhone" label="联系电话" width="150" />
        <el-table-column prop="recipientAddress" label="收货地址" min-width="200" />
        <el-table-column prop="estimatedDelivery" label="预计送达" width="180" />
        <el-table-column prop="actualDelivery" label="实际送达" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <div class="table-action-buttons">
              <el-button type="primary" size="small" @click="handleViewTracking(scope.row)" v-permission="'logistics_view'">
                <el-icon><View /></el-icon>
                追踪
              </el-button>
              <el-button type="warning" size="small" @click="handleEditShipment(scope.row)" v-permission="'logistics_edit'">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="info" size="small" @click="handlePrintWaybill(scope.row)" v-permission="'logistics_print'">
                <el-icon><Printer /></el-icon>
                打印
              </el-button>
              <el-button type="danger" size="small" @click="handleCancelShipment(scope.row)" :disabled="scope.row.status !== 'pending'" v-permission="'logistics_cancel'">
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
  </div>

    <!-- 编辑物流单对话框 -->
    <EditDialog
      v-model="editDialogVisible"
      title="编辑物流单"
      :is-loading="isEditLoading"
      @confirm="confirmEditShipment"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="物流单号">
          <el-input v-model="editForm.trackingNo" disabled />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="editForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流商">
          <el-select v-model="editForm.carrier" placeholder="请选择物流商">
            <el-option label="顺丰速运" value="sf_express" />
            <el-option label="中通快递" value="zhongtong" />
            <el-option label="申通快递" value="shentong" />
            <el-option label="圆通快递" value="yuantong" />
            <el-option label="韵达快递" value="yunda" />
          </el-select>
        </el-form-item>
        <el-form-item label="收件人姓名">
          <el-input v-model="editForm.recipientName" placeholder="请输入收件人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="editForm.recipientPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input 
            v-model="editForm.recipientAddress" 
            type="textarea" 
            :rows="3"
            placeholder="请输入收货地址" 
          />
        </el-form-item>
        <el-form-item label="物流状态">
          <el-select v-model="editForm.status" placeholder="请选择物流状态">
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已签收" value="delivered" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计送达时间">
          <el-date-picker
            v-model="editForm.estimatedDelivery"
            type="datetime"
            placeholder="请选择预计送达时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
    </EditDialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Ship, Document, Warning, View, Edit, Printer, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import EditDialog from '../components/EditDialog.vue'

// 搜索表单数据
const searchForm = ref({
  trackingNo: '',
  orderNo: '',
  status: undefined,
  carrier: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 100
})

// 物流信息列表
const logisticsList = ref([
  {
    trackingNo: 'SF1234567890123',
    orderNo: 'O-20251205-001',
    carrier: 'sf_express',
    status: 'delivered',
    recipientName: '张三',
    recipientPhone: '13800138001',
    recipientAddress: '北京市朝阳区某某街道123号',
    estimatedDelivery: '2025-12-05 18:00:00',
    actualDelivery: '2025-12-05 16:30:00',
    createdAt: '2025-12-03 10:00:00'
  },
  {
    trackingNo: 'ZT9876543210987',
    orderNo: 'O-20251205-002',
    carrier: 'zhongtong',
    status: 'in_transit',
    recipientName: '李四',
    recipientPhone: '13800138002',
    recipientAddress: '上海市浦东新区某某街道456号',
    estimatedDelivery: '2025-12-06 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-04 14:30:00'
  },
  {
    trackingNo: 'ST6543210987654',
    orderNo: 'O-20251205-003',
    carrier: 'shentong',
    status: 'shipped',
    recipientName: '王五',
    recipientPhone: '13800138003',
    recipientAddress: '广州市天河区某某街道789号',
    estimatedDelivery: '2025-12-07 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-05 09:15:00'
  },
  {
    trackingNo: 'YT3210987654321',
    orderNo: 'O-20251205-004',
    carrier: 'yuantong',
    status: 'pending',
    recipientName: '赵六',
    recipientPhone: '13800138004',
    recipientAddress: '深圳市南山区某某街道321号',
    estimatedDelivery: null,
    actualDelivery: null,
    createdAt: '2025-12-05 11:45:00'
  },
  {
    trackingNo: 'YD4567890123456',
    orderNo: 'O-20251205-005',
    carrier: 'yunda',
    status: 'exception',
    recipientName: '孙七',
    recipientPhone: '13800138005',
    recipientAddress: '杭州市西湖区某某街道654号',
    estimatedDelivery: '2025-12-05 18:00:00',
    actualDelivery: null,
    createdAt: '2025-12-02 16:30:00'
  }
])

// 编辑相关状态
const editDialogVisible = ref(false)
const isEditLoading = ref(false)
const editForm = ref({
  trackingNo: '',
  orderNo: '',
  carrier: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  status: '',
  estimatedDelivery: ''
})

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    trackingNo: '',
    orderNo: '',
    status: undefined,
    carrier: undefined
  }
  pagination.value.page = 1
  ElMessage.success('重置完成')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
}

// 创建物流单
const handleCreateShipment = () => {
  ElMessage.info('创建物流单功能开发中')
}

// 批量发货
const handleBatchShip = () => {
  ElMessage.info('批量发货功能开发中')
}

// 物流商管理
const handleViewCarriers = () => {
  ElMessage.info('物流商管理功能开发中')
}

// 异常追踪
const handleTrackException = () => {
  ElMessage.info('异常追踪功能开发中')
}

// 追踪物流轨迹
const handleViewTracking = (_logistics: any) => {
  ElMessage.info('追踪物流轨迹功能开发中')
}

// 编辑物流单
const handleEditShipment = (logistics: any) => {
  editForm.value = {
    trackingNo: logistics.trackingNo,
    orderNo: logistics.orderNo,
    carrier: logistics.carrier,
    recipientName: logistics.recipientName,
    recipientPhone: logistics.recipientPhone,
    recipientAddress: logistics.recipientAddress,
    status: logistics.status,
    estimatedDelivery: logistics.estimatedDelivery
  }
  editDialogVisible.value = true
}

// 确认编辑物流单
const confirmEditShipment = async () => {
  try {
    isEditLoading.value = true
    
    // 验证表单
    if (!editForm.value.recipientName || !editForm.value.recipientPhone || !editForm.value.recipientAddress) {
      ElMessage.error('请填写完整的收件人信息')
      return
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(editForm.value.recipientPhone)) {
      ElMessage.error('请输入正确的手机号码')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地数据
    const index = logisticsList.value.findIndex(item => item.trackingNo === editForm.value.trackingNo)
    if (index !== -1 && logisticsList.value[index]) {
      Object.assign(logisticsList.value[index], {
        carrier: editForm.value.carrier,
        recipientName: editForm.value.recipientName,
        recipientPhone: editForm.value.recipientPhone,
        recipientAddress: editForm.value.recipientAddress,
        status: editForm.value.status,
        estimatedDelivery: editForm.value.estimatedDelivery
      })
    }
    
    editDialogVisible.value = false
    ElMessage.success('物流单信息已更新')
  } catch (error) {
    ElMessage.error('更新物流单信息失败')
    console.error('更新物流单失败:', error)
  } finally {
    isEditLoading.value = false
  }
}

// 打印面单
const handlePrintWaybill = (_logistics: any) => {
  ElMessage.info('打印面单功能开发中')
}

// 取消物流单
const handleCancelShipment = async (logistics: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消物流单「${logistics.trackingNo}」吗？此操作不可撤销。`,
      '取消物流单确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留物流单',
        type: 'warning',
        customClass: 'cancel-task-message-box',
        confirmButtonClass: 'cancel-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    // 调用取消物流单API
    ElMessage.success('物流单已取消')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('取消物流单失败')
      console.error('取消物流单失败:', error)
    }
  }
}
</script>

<style scoped>
.logistics-center {
  padding: var(--spacing-xl);
}

.action-bar {
  margin-bottom: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
}/* 搜索表单样式 */
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