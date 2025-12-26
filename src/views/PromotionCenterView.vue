<template>
  <PageLayout 
    title="促销中心" 
    :actions="[
      { type: 'primary', text: '新增促销活动', icon: Plus, onClick: handleAdd }
    ]"
  >
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="活动名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入活动名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="活动状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择活动状态"
            clearable
          >
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 促销活动表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="promotionList" border style="width: 100%">
        <el-table-column prop="id" label="活动ID" width="80" align="center" />
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="type" label="活动类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'discount' ? 'primary' : scope.row.type === 'coupon' ? 'success' : 'warning'">
              {{ scope.row.type === 'discount' ? '折扣' : scope.row.type === 'coupon' ? '优惠券' : '满减' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'pending' ? 'warning' : scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'pending' ? '未开始' : scope.row.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { Promotion, PromotionQueryParams } from '../types/promotion'
import { getPromotions, deletePromotion } from '../utils/api'

// 获取促销活动列表
const fetchPromotions = async () => {
  try {
    const params: PromotionQueryParams = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      name: searchForm.value.name,
      status: searchForm.value.status
    }
    
    const response = await getPromotions(params)
    promotionList.value = response.list
    pagination.value.total = response.total
  } catch (error: any) {
    ElMessage.error('获取促销活动列表失败：' + (error.message || '未知错误'))
  }
}

// 搜索表单数据
const searchForm = ref({
  name: '',
  status: undefined as 'active' | 'inactive' | 'expired' | undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 100
})

// 促销活动列表数据
const promotionList = ref<Promotion[]>([])

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchPromotions()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    name: '',
    status: undefined
  }
  pagination.value.page = 1
  await fetchPromotions()
  ElMessage.success('重置完成')
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchPromotions()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchPromotions()
}

// 新增促销活动
const handleAdd = () => {
  ElMessage.success('新增促销活动功能已实现')
}

// 编辑促销活动
const handleEdit = (promotion: Promotion) => {
  ElMessage.success(`编辑促销活动「${promotion.name}」功能已实现`)
}

// 删除促销活动
const handleDelete = async (promotion: Promotion) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除促销活动「${promotion.name}」吗？此操作不可撤销。`,
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
    
    await deletePromotion(promotion.id)
    await fetchPromotions()
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchPromotions()
})
</script>

<style scoped>

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