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

    <!-- 入库对话框 -->
    <el-dialog
      v-model="stockInDialogVisible"
      title="入库"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="stockInFormRef"
        :model="stockInForm"
        :rules="stockInRules"
        label-width="100px"
      >
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="stockInForm.warehouseId"
            placeholder="请选择仓库"
            style="width: 100%"
          >
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品名称" prop="productName">
          <el-input
            v-model="stockInForm.productName"
            placeholder="请输入商品名称"
          />
        </el-form-item>
        
        <el-form-item label="商品SKU" prop="sku">
          <el-input
            v-model="stockInForm.sku"
            placeholder="请输入商品SKU"
          />
        </el-form-item>
        
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number
            v-model="stockInForm.quantity"
            :min="1"
            :max="999999"
            placeholder="请输入入库数量"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="安全库存" prop="minStock">
          <el-input-number
            v-model="stockInForm.minStock"
            :min="0"
            :max="999999"
            placeholder="请输入安全库存"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="最大库存" prop="maxStock">
          <el-input-number
            v-model="stockInForm.maxStock"
            :min="0"
            :max="999999"
            placeholder="请输入最大库存"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="stockInDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitStockIn">
          确定入库
        </el-button>
      </template>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog
      v-model="stockOutDialogVisible"
      title="出库"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="stockOutFormRef"
        :model="stockOutForm"
        :rules="stockOutRules"
        label-width="100px"
      >
        <el-form-item label="选择商品" prop="inventoryId">
          <el-select
            v-model="stockOutForm.inventoryId"
            placeholder="请选择要出库的商品"
            style="width: 100%"
            @change="handleInventorySelect"
          >
            <el-option
              v-for="item in stockList"
              :key="item.id"
              :label="`${item.productName} (${item.sku}) - 当前库存: ${item.quantity}`"
              :value="item.id"
              :disabled="item.quantity <= 0"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品名称">
          <el-input :value="selectedInventory?.productName || ''" disabled />
        </el-form-item>
        
        <el-form-item label="商品SKU">
          <el-input :value="selectedInventory?.sku || ''" disabled />
        </el-form-item>
        
        <el-form-item label="仓库">
          <el-input :value="selectedInventory?.warehouseName || ''" disabled />
        </el-form-item>
        
        <el-form-item label="当前库存">
          <el-input :value="selectedInventory?.quantity?.toString() || '0'" disabled />
        </el-form-item>
        
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number
            v-model="stockOutForm.quantity"
            :min="1"
            :max="selectedInventory?.quantity ?? 999999"
            placeholder="请输入出库数量"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="出库原因" prop="remark">
          <el-input
            v-model="stockOutForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入出库原因（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="stockOutDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="submitStockOut">
          确定出库
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑库存对话框 -->
    <el-dialog
      v-model="editStockDialogVisible"
      title="编辑库存"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editStockFormRef"
        :model="editStockForm"
        :rules="editStockRules"
        label-width="100px"
      >
        <el-form-item label="商品名称">
          <el-input :value="editStockForm.productName" disabled />
        </el-form-item>
        
        <el-form-item label="商品SKU">
          <el-input :value="editStockForm.sku" disabled />
        </el-form-item>
        
        <el-form-item label="仓库">
          <el-input :value="editStockForm.warehouseName" disabled />
        </el-form-item>
        
        <el-form-item label="当前库存" prop="quantity">
          <el-input-number
            v-model="editStockForm.quantity"
            :min="0"
            :max="999999"
            placeholder="请输入当前库存"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="安全库存" prop="minStock">
          <el-input-number
            v-model="editStockForm.minStock"
            :min="0"
            :max="999999"
            placeholder="请输入安全库存"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="最大库存" prop="maxStock">
          <el-input-number
            v-model="editStockForm.maxStock"
            :min="0"
            :max="999999"
            placeholder="请输入最大库存"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editStockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEditStock">
          保存修改
        </el-button>
      </template>
    </el-dialog>

  </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Minus, Edit, Document } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
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

// 对话框显示状态
const stockInDialogVisible = ref(false)
const stockOutDialogVisible = ref(false)
const editStockDialogVisible = ref(false)
const submitting = ref(false)

// 表单引用
const stockInFormRef = ref<FormInstance>()
const stockOutFormRef = ref<FormInstance>()
const editStockFormRef = ref<FormInstance>()

// 入库表单数据
const stockInForm = ref({
  warehouseId: undefined as number | undefined,
  productName: '',
  sku: '',
  quantity: 1,
  minStock: 0,
  maxStock: 1000
})

// 入库表单验证规则
const stockInRules: FormRules = {
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  sku: [{ required: true, message: '请输入商品SKU', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  minStock: [{ required: true, message: '请输入安全库存', trigger: 'blur' }],
  maxStock: [{ required: true, message: '请输入最大库存', trigger: 'blur' }]
}

// 出库表单数据
const stockOutForm = ref({
  inventoryId: undefined as number | undefined,
  quantity: 1,
  remark: ''
})

// 出库表单验证规则
const stockOutRules: FormRules = {
  inventoryId: [{ required: true, message: '请选择要出库的商品', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    { validator: (_rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('出库数量必须大于0'))
      } else if (selectedInventory.value && value > selectedInventory.value.quantity) {
        callback(new Error('出库数量不能超过当前库存'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 编辑库存表单数据
const editStockForm = ref({
  id: 0,
  warehouseId: 0,
  warehouseName: '',
  productName: '',
  sku: '',
  quantity: 0,
  minStock: 0,
  maxStock: 0
})

// 编辑库存表单验证规则
const editStockRules: FormRules = {
  quantity: [{ required: true, message: '请输入当前库存', trigger: 'blur' }],
  minStock: [{ required: true, message: '请输入安全库存', trigger: 'blur' }],
  maxStock: [{ required: true, message: '请输入最大库存', trigger: 'blur' }]
}

// 选中的库存项（用于出库）
const selectedInventory = computed(() => {
  if (!stockOutForm.value.inventoryId) return null
  return stockList.value.find(item => item.id === stockOutForm.value.inventoryId) || null
})

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
const handleStockIn = () => {
  const defaultWarehouse = warehouseList.value.length > 0 ? warehouseList.value[0] : null
  stockInForm.value = {
    warehouseId: defaultWarehouse?.id,
    productName: '',
    sku: '',
    quantity: 1,
    minStock: 0,
    maxStock: 1000
  }
  stockInDialogVisible.value = true
}

// 提交入库
const submitStockIn = async () => {
  if (!stockInFormRef.value) return
  
  await stockInFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        const data: InventoryCreateRequest = {
          warehouseId: stockInForm.value.warehouseId!,
          productName: stockInForm.value.productName,
          sku: stockInForm.value.sku,
          quantity: stockInForm.value.quantity,
          minStock: stockInForm.value.minStock,
          maxStock: stockInForm.value.maxStock
        }
        
        await createInventory(data)
        ElMessage.success('入库成功')
        stockInDialogVisible.value = false
        await fetchInventory()
      } catch (error) {
        ElMessage.error('入库失败: ' + (error as Error).message)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 出库操作
const handleStockOut = async () => {
  if (stockList.value.length === 0) {
    ElMessage.warning('没有可出库的库存')
    return
  }
  
  stockOutForm.value = {
    inventoryId: undefined,
    quantity: 1,
    remark: ''
  }
  stockOutDialogVisible.value = true
}

// 选择库存项
const handleInventorySelect = () => {
  if (selectedInventory.value) {
    stockOutForm.value.quantity = 1
  }
}

// 提交出库
const submitStockOut = async () => {
  if (!stockOutFormRef.value || !selectedInventory.value) return
  
  await stockOutFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        const currentInventory = selectedInventory.value!
        
        const updatedStock: InventoryUpdateRequest = {
          id: currentInventory.id,
          warehouseId: currentInventory.warehouseId,
          productName: currentInventory.productName,
          sku: currentInventory.sku,
          quantity: currentInventory.quantity - stockOutForm.value.quantity,
          minStock: currentInventory.minStock,
          maxStock: currentInventory.maxStock
        }
        
        await updateInventory(updatedStock)
        ElMessage.success('出库成功')
        stockOutDialogVisible.value = false
        await fetchInventory()
      } catch (error) {
        ElMessage.error('出库失败: ' + (error as Error).message)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 编辑库存
const handleEditStock = (stock: Inventory) => {
  editStockForm.value = {
    id: stock.id,
    warehouseId: stock.warehouseId,
    warehouseName: stock.warehouseName,
    productName: stock.productName,
    sku: stock.sku,
    quantity: stock.quantity,
    minStock: stock.minStock,
    maxStock: stock.maxStock
  }
  editStockDialogVisible.value = true
}

// 提交编辑库存
const submitEditStock = async () => {
  if (!editStockFormRef.value) return
  
  await editStockFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        
        const updatedStock: InventoryUpdateRequest = {
          id: editStockForm.value.id,
          warehouseId: editStockForm.value.warehouseId,
          productName: editStockForm.value.productName,
          sku: editStockForm.value.sku,
          quantity: editStockForm.value.quantity,
          minStock: editStockForm.value.minStock,
          maxStock: editStockForm.value.maxStock
        }
        
        await updateInventory(updatedStock)
        ElMessage.success('库存更新成功')
        editStockDialogVisible.value = false
        await fetchInventory()
      } catch (error) {
        ElMessage.error('库存更新失败: ' + (error as Error).message)
      } finally {
        submitting.value = false
      }
    }
  })
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