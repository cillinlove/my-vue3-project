<template>
  <PageLayout title="商品管理" :showRefresh="true" :onRefresh="handleRefresh">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item label="商品分类">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择商品分类"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 商品表格 -->
    <el-card shadow="never" class="table-container mt-4">
      <el-table :data="productList" style="width: 100%" border>
        <el-table-column prop="id" label="商品ID" width="80" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="商品分类" width="120" align="center" />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="scope">
            {{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" class="mr-2">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
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
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageLayout from '../components/PageLayout.vue'
import type { Product, ProductQueryParams } from '../types/product'
import { getCategories, getProducts } from '../utils/api'

// 搜索表单数据
const searchForm = ref({
  name: '',
  category: undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 商品列表数据
const productList = ref<Product[]>([])

// 商品分类数据
const categories = ref<any[]>([])

// 加载商品数据
const loadProducts = async () => {
  const params: ProductQueryParams = {
    ...searchForm.value,
    page: pagination.value.page,
    pageSize: pagination.value.pageSize
  }
  
  const result = await getProducts(params)
  productList.value = result.list
  pagination.value.total = result.total
}

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await loadProducts()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    name: '',
    category: undefined
  }
  pagination.value.page = 1
  await loadProducts()
  ElMessage.success('重置完成')
}

// 编辑商品
const handleEdit = (product: Product) => {
  ElMessage.info(`编辑商品：${product.name}`)
  // 这里可以跳转到编辑页面或打开编辑弹窗
}

// 删除商品
const handleDelete = (product: Product) => {
  ElMessage.warning(`删除商品：${product.name}`)
  // 这里可以实现删除功能
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await loadProducts()
}

// 当前页码变化
const handleCurrentChange = async (page: number) => {
  pagination.value.page = page
  await loadProducts()
}

// 刷新功能
const handleRefresh = async () => {
  await loadProducts()
  ElMessage.success('数据已刷新')
}

// 页面挂载时加载数据
onMounted(async () => {
  await loadCategories()
  await loadProducts()
})

// 加载商品分类
const loadCategories = async () => {
  categories.value = await getCategories()
}
</script>

<style scoped>
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

/* 按钮间距 */
.mr-2 {
  margin-right: var(--spacing-md);
}
</style>
