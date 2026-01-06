<template>
  <PageLayout title="订单管理">
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择订单状态"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="(label, value) in orderStatusMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD"
            clearable
            style="width: 320px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 订单表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="orderList" style="width: 100%" border>
      <el-table-column prop="orderNo" label="订单号" min-width="150" show-overflow-tooltip />
      <el-table-column prop="userName" label="用户名称" width="120" align="center" />
      <el-table-column prop="totalAmount" label="总金额" width="120" align="center">
        <template #default="scope">
          {{ scope.row.totalAmount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120" align="center">
        <template #default="scope">
          <el-tag
            :type="orderStatusTagType(scope.row.status)"
            size="small"
          >
            {{ orderStatusMap[scope.row.status as OrderStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              查看详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleShip(scope.row)"
              :disabled="scope.row.status !== 'paid'"
            >
              发货
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
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
    </el-card>
    
    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      destroy-on-close
    >
      <div class="order-detail">
        <!-- 订单基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder?.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户名称">{{ currentOrder?.userName }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
          <el-tag :type="orderStatusTagType(currentOrder?.status || 'pending_payment')">
            {{ orderStatusMap[currentOrder?.status as OrderStatus || 'pending_payment'] }}
          </el-tag>
        </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ currentOrder?.paymentMethod }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentOrder?.createdAt || '') }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ currentOrder?.totalAmount.toFixed(2) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 收货地址信息 -->
        <h3 class="section-title">收货地址</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收货地址">{{ currentOrder?.shippingAddress }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder?.contactPhone }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 商品列表 -->
        <h3 class="section-title">商品列表</h3>
        <el-table :data="currentOrder?.orderItems" stripe style="width: 100%">
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">¥{{ scope.row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="total" label="小计" width="100">
            <template #default="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OrderStatus } from '../types/order'
import type { Order, OrderQueryParams } from '../types/order'
import { getOrders, updateOrderStatus } from '../utils/api'
import PageLayout from '../components/PageLayout.vue'

// 订单状态映射
const orderStatusMap = {
  pending_payment: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}

// 搜索表单数据
const searchForm = ref({
  orderNo: undefined as string | undefined,
  userName: undefined as string | undefined,
  status: undefined as OrderStatus | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined
})

// 日期范围
const dateRange = ref<string[]>([])

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 订单列表数据
const orderList = ref<Order[]>([])

// 订单详情弹窗
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)

// 加载订单数据
const loadOrders = async () => {
  const params: OrderQueryParams = {
    ...searchForm.value,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  
  const result = await getOrders(params)
  orderList.value = result.list
  pagination.value.total = result.total
}

// 搜索
const handleSearch = () => {
  // 处理日期范围
  if (dateRange.value.length === 2) {
    searchForm.value.startTime = dateRange.value[0]
    searchForm.value.endTime = dateRange.value[1]
  } else {
    searchForm.value.startTime = undefined
    searchForm.value.endTime = undefined
  }
  
  pagination.value.page = 1
  loadOrders()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    orderNo: undefined,
    userName: undefined,
    status: undefined,
    startTime: undefined,
    endTime: undefined
  }
  dateRange.value = []
  pagination.value.page = 1
  loadOrders()
  ElMessage.success('重置完成')
}

// 查看订单详情
const handleViewDetail = (order: Order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 发货操作
const handleShip = async (order: Order) => {
  try {
    await ElMessageBox.confirm(
      `确定要为订单「${order.orderNo}」发货吗？此操作不可撤销。`,
      '发货确认',
      {
        confirmButtonText: '确定发货',
        cancelButtonText: '取消',
        type: 'success',
        customClass: 'ship-confirm-message-box',
        confirmButtonClass: 'ship-confirm-btn',
        distinguishCancelAndClose: true,
        autofocus: false,
      }
    )
    
    // 调用发货API
    await updateOrderStatus(order.id, OrderStatus.SHIPPED)
    
    ElMessage.success('发货成功')
    loadOrders() // 重新加载订单列表
  } catch (error) {
    // 用户取消操作
    if ((error as any).message !== 'cancel') {
      ElMessage.error('发货失败')
    }
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadOrders()
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  loadOrders()
}

// 订单状态标签类型
const orderStatusTagType = (status: OrderStatus = 'pending_payment') => {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'warning'
    case OrderStatus.PAID:
      return 'primary'
    case OrderStatus.SHIPPED:
      return 'success'
    case OrderStatus.COMPLETED:
      return 'success'
    case OrderStatus.CANCELLED:
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 页面挂载时加载数据
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 标题栏 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

/* 搜索表单 */
.search-form {
  margin-bottom: 0;
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

/* 表格容器 */
.table-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 分页容器 */
.pagination-container {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md) 0;
}

.order-detail {
  margin-top: var(--spacing-md);
}

.section-title {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.section-title:first-of-type {
  margin-top: 0;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}
</style>
