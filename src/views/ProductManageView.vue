<template>
  <PageLayout 
    title="商品管理" 
    :actions="[
      {
        type: 'primary',
        text: '新增商品',
        icon: Plus,
        onClick: handleAdd
      }
    ]"
  >
    
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
    <el-card shadow="never" class="table-container">
      <el-table :data="productList" style="width: 100%" @selection-change="handleSelectionChange" border>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="商品ID" width="80" align="center" />
      <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="商品分类" width="120" align="center" />
      <el-table-column prop="price" label="价格" width="100" align="center">
        <template #default="scope">
          {{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" align="center" />
      <el-table-column prop="images" label="商品图片" width="200" align="center">
        <template #default="scope">
          <div class="image-preview" v-if="scope.row.images.length > 0">
            <el-image
              v-if="scope.row.images[0]"
              :src="scope.row.images[0]"
              :preview-src-list="scope.row.images"
              fit="cover"
              class="product-image"
            >
              <template #placeholder>
                <div class="image-placeholder">无图片</div>
              </template>
            </el-image>
            <span v-if="scope.row.images.length > 1" class="image-count">+{{ scope.row.images.length - 1 }}</span>
          </div>
          <span v-else class="no-image">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)" class="mr-2">
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item prop="name" label="商品名称">
          <el-input
            v-model="productForm.name"
            placeholder="请输入商品名称"
          />
        </el-form-item>
        
        <el-form-item prop="price" label="商品价格">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="请输入商品价格"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item prop="stock" label="商品库存">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            :step="1"
            placeholder="请输入商品库存"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item prop="category" label="商品分类">
          <el-select
            v-model="productForm.category"
            placeholder="请选择商品分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片">
          <el-upload
            v-model:file-list="uploadFileList"
            class="image-uploader"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            list-type="picture-card"
            :limit="5"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                请上传图片，最多5张
              </div>
            </template>
          </el-upload>
          
          <!-- 图片列表 -->
          <div class="preview-list" v-if="productForm.images.length > 0">
            <div class="preview-item" v-for="(image, index) in productForm.images" :key="index">
              <el-image
                :src="image"
                :preview-src-list="productForm.images"
                fit="cover"
              >
                <template #error>
                  <div class="image-placeholder">图片加载失败</div>
                </template>
              </el-image>
              <el-button
                type="danger"
                size="small"
                class="delete-image-btn"
                @click="handleImageDelete(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '更新' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type {
  Product,
  ProductQueryParams,
  ProductCreateRequest,
  ProductUpdateRequest
} from '../types/product'
import {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
} from '../utils/api'

// 商品分类
const categories = ref<Array<{ id: number; name: string }>>([])

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
// 选中的商品
const selectedProducts = ref<Product[]>([])
// 加载状态
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const productFormRef = ref<FormInstance>()

// 上传文件列表
const uploadFileList = ref<any[]>([])

// 商品表单数据
const productForm = reactive({
  id: 0,
  name: '',
  price: 0,
  stock: 0,
  category: 0,
  images: [] as string[]
})

// 表单验证规则
const productRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '商品价格必须大于等于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '商品库存必须大于等于0', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ]
})

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    const params: ProductQueryParams = {
      ...searchForm.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    const result = await getProducts(params)
    productList.value = result.list
    pagination.value.total = result.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadProducts()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    name: '',
    category: undefined
  }
  pagination.value.page = 1
  loadProducts()
  ElMessage.success('重置完成')
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadProducts()
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  loadProducts()
}

// 选择变化
const handleSelectionChange = (selection: Product[]) => {
  selectedProducts.value = selection
}

// 打开新增对话框
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (product: Product) => {
  isEdit.value = true
  // 填充表单数据
  Object.assign(productForm, product)
  // 清空上传文件列表
  uploadFileList.value = []
  dialogVisible.value = true
}

// 删除商品
const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品「${product.name}」吗？此操作不可撤销。`,
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
    
    await deleteProduct(product.id)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
      console.error('删除商品失败:', error)
    }
  }
}

// 重置表单
const resetForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    id: 0,
    name: '',
    price: 0,
    stock: 0,
    category: 0,
    images: []
  })
  uploadFileList.value = []
}

// 处理文件变化
const handleFileChange = async (file: any) => {
  try {
    // 上传文件
    const imageUrl = await uploadImage(file.raw)
    productForm.images.push(imageUrl)
    // 从上传列表中移除已处理的文件
    uploadFileList.value = []
    ElMessage.success('图片上传成功')
  } catch (error: any) {
    ElMessage.error('图片上传失败：' + (error.message || '未知错误'))
  }
}

// 处理文件移除
const handleFileRemove = (file: any) => {
  // 从上传列表中移除
  const index = uploadFileList.value.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    uploadFileList.value.splice(index, 1)
  }
}

// 处理图片删除
const handleImageDelete = (index: number) => {
  productForm.images.splice(index, 1)
  ElMessage.success('图片删除成功')
}

// 处理对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    loading.value = true
    
    if (isEdit.value) {
      // 编辑商品
      const updateData: ProductUpdateRequest = {
        ...productForm
      } as ProductUpdateRequest
      await updateProduct(updateData)
      ElMessage.success('商品更新成功')
    } else {
      // 新增商品
      const createData: ProductCreateRequest = {
        name: productForm.name,
        price: productForm.price,
        stock: productForm.stock,
        category: productForm.category,
        images: productForm.images
      }
      await createProduct(createData)
      ElMessage.success('商品新增成功')
    }
    
    dialogVisible.value = false
    loadProducts() // 重新加载数据
  } catch (error: any) {
    if (error.name !== 'ValidationError') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(async () => {
  // 加载商品分类
  categories.value = await getCategories()
  // 加载商品列表
  await loadProducts()
})
</script>

<style scoped>
.product-manage {
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

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
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

/* 图片预览 */
.image-preview {
  position: relative;
  display: inline-block;
}

.product-image {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-sm);
}

.image-count {
  position: absolute;
  right: -10px;
  top: -10px;
  background-color: var(--danger-color);
  color: var(--text-white);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: 10px;
}

.no-image {
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
}

/* 上传图片 */
.image-uploader .el-upload {
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color var(--transition-fast);
  width: 120px;
  height: 120px;
}

.image-uploader .el-upload:hover {
  border-color: var(--primary-color);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
}

/* 预览列表 */
.preview-list {
  margin-top: var(--spacing-md);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.preview-item {
  position: relative;
  width: 120px;
  height: 90px;
}

.preview-item .el-image {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
}

/* 删除图片按钮 */
.delete-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 2px;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.mr-2 {
  margin-right: var(--spacing-sm);
}
</style>