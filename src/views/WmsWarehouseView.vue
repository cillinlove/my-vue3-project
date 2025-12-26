<template>
  <PageLayout
    title="WMS仓库管理"
    :actions="[
      { type: 'primary', text: '入库', icon: Plus, onClick: handleStockIn },
      { type: 'warning', text: '出库', icon: Minus, onClick: handleStockOut }
    ]"
  >
    <div class="wms-warehouse">
    
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="商品SKU">
          <el-input
            v-model="searchForm.sku"
            placeholder="请输入商品SKU"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="仓库">
          <el-select
            v-model="searchForm.warehouseId"
            placeholder="请选择仓库"
            clearable
          >
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 商品库存列表表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="stockList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="sku" label="商品SKU" width="150" align="center" />
        <el-table-column prop="warehouseName" label="仓库" width="120" align="center">
          <template #default="scope">
            <el-tag type="primary">
              {{ scope.row.warehouseName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="当前库存" width="120" align="center" />
        <el-table-column prop="minStock" label="安全库存" width="120" align="center" />
        <el-table-column prop="maxStock" label="最大库存" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="{
              'normal': 'success',
              'low': 'danger',
              'high': 'warning'
            }[scope.row.status as 'normal' | 'low' | 'high']">
              {{ {
                'normal': '正常',
                'low': '库存不足',
                'high': '库存溢出'
              }[scope.row.status as 'normal' | 'low' | 'high'] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleEditStock(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑库存
              </el-button>
              <el-button type="info" size="small" @click="handleViewLog(scope.row)">
                <el-icon><Document /></el-icon>
                库存日志
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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus, Edit, Document } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { Inventory, InventoryQueryParams, Warehouse, InventoryCreateRequest, InventoryUpdateRequest } from '../types/wms'
import { getInventory, getWarehouses, createInventory, updateInventory } from '../utils/api'

// 搜索表单数据
const searchForm = ref({
  productName: '',
  sku: '',
  warehouseId: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 仓库列表
const warehouseList = ref<Warehouse[]>([])

// 商品库存列表数据
const stockList = ref<Inventory[]>([])

// 获取仓库列表
const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses({ page: 1, pageSize: 100 })
    warehouseList.value = response.list
  } catch (error) {
    ElMessage.error('获取仓库列表失败')
  }
}

// 获取库存列表
const fetchInventory = async () => {
  try {
    const params: InventoryQueryParams = {
      productName: searchForm.value.productName,
      sku: searchForm.value.sku,
      warehouseId: searchForm.value.warehouseId,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    const response = await getInventory(params)
    stockList.value = response.list
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error('获取库存列表失败')
  }
}

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchInventory()
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    productName: '',
    sku: '',
    warehouseId: undefined
  }
  pagination.value.page = 1
  await fetchInventory()
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchInventory()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await fetchInventory()
}

// 入库操作
const handleStockIn = async () => {
  try {
    // 这里可以添加入库表单
    // 暂时使用示例数据
    const newStock: InventoryCreateRequest = {
      warehouseId: 1,
      productName: '测试商品',
      sku: 'TEST' + Date.now(),
      quantity: 100,
      minStock: 10,
      maxStock: 200
    }
    
    await createInventory(newStock)
    ElMessage.success('入库成功')
    await fetchInventory()
  } catch (error) {
    ElMessage.error('入库失败: ' + (error as Error).message)
  }
}

// 出库操作
const handleStockOut = async () => {
  try {
    if (stockList.value.length === 0) {
      ElMessage.warning('没有可出库的库存')
      return
    }
    
    // 这里可以添加出库选择表单
    // 暂时选择第一个库存项
    const stockToOut = stockList.value[0]
    if (!stockToOut) {
      ElMessage.warning('没有可出库的库存')
      return
    }
    
    // 出库1个
    const updatedStock: InventoryUpdateRequest = {
      ...stockToOut,
      quantity: Math.max(0, stockToOut.quantity - 1)
    }
    
    await updateInventory(updatedStock)
    ElMessage.success('出库成功')
    await fetchInventory()
  } catch (error) {
    ElMessage.error('出库失败: ' + (error as Error).message)
  }
}

// 编辑库存
const handleEditStock = async (stock: Inventory) => {
  try {
    // 这里可以添加编辑表单
    // 暂时增加10个库存
    const updatedStock: InventoryUpdateRequest = {
      ...stock,
      quantity: stock.quantity + 10
    }
    
    await updateInventory(updatedStock)
    ElMessage.success('库存更新成功')
    await fetchInventory()
  } catch (error) {
    ElMessage.error('库存更新失败: ' + (error as Error).message)
  }
}

// 查看库存日志
const handleViewLog = (_stock: Inventory) => {
  ElMessage.info('查看库存日志功能开发中')
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchWarehouses()
  await fetchInventory()
})
</script>

<style scoped>
.wms-warehouse {
  padding: var(--spacing-xl);
}

.action-bar {
  margin-bottom: var(--spacing-md);
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

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}
</style>