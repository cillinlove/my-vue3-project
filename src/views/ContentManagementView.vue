<template>
  <PageLayout 
    title="内容管理" 
    :actions="[
      { type: 'primary', text: '新增内容', icon: Plus, onClick: handleAdd }
    ]"
  >
    <!-- 搜索表单 -->
    <el-card shadow="never" class="search-form">
      <el-form :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="内容标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入内容标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="内容类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择内容类型"
            clearable
          >
            <el-option label="文章" value="article" />
            <el-option label="横幅" value="banner" />
            <el-option label="公告" value="notice" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择内容状态"
            clearable
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 内容列表表格 -->
    <el-card shadow="never" class="table-container">
      <el-table :data="contentList" border style="width: 100%">
        <el-table-column prop="id" label="内容ID" width="80" align="center" />
        <el-table-column prop="title" label="内容标题" min-width="250" />
        <el-table-column prop="type" label="内容类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'article' ? 'primary' : scope.row.type === 'banner' ? 'success' : 'warning'">
              {{ scope.row.type === 'article' ? '文章' : scope.row.type === 'banner' ? '横幅' : '公告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'draft' ? 'warning' : scope.row.status === 'published' ? 'success' : 'info'">
              {{ scope.row.status === 'draft' ? '草稿' : scope.row.status === 'published' ? '已发布' : '' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
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

    <!-- 新增/编辑内容对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑内容' : '新增内容'"
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
        <el-form-item label="内容标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入内容标题" maxlength="200" show-word-limit />
        </el-form-item>
        
        <el-form-item label="内容类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择内容类型" style="width: 100%">
            <el-option label="文章" value="article" />
            <el-option label="横幅" value="banner" />
            <el-option label="公告" value="notice" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入内容" />
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
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { Content, ContentQueryParams, ContentCreateRequest, ContentUpdateRequest } from '../types/content'
import { getContents, createContent, updateContent, deleteContent } from '../utils/api'
import PageLayout from '../components/PageLayout.vue'

// 搜索表单数据
const searchForm = ref({
  title: '',
  type: undefined as 'article' | 'banner' | 'notice' | undefined,
  status: undefined as 'published' | 'draft' | undefined
})

// 分页数据
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 内容列表数据
const contentList = ref<Content[]>([])

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: undefined as number | undefined,
  title: '',
  type: 'article' as 'article' | 'banner' | 'notice',
  content: '',
  status: 'draft' as 'published' | 'draft',
  sort: 0
})

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' },
    { min: 2, max: 200, message: '内容标题长度在 2 到 200 个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取内容列表
const fetchContents = async () => {
  try {
    const params: ContentQueryParams = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      title: searchForm.value.title,
      type: searchForm.value.type,
      status: searchForm.value.status
    }
    const response = await getContents(params)
    contentList.value = response.list
    pagination.value.total = response.total
  } catch (error: any) {
    ElMessage.error('获取内容列表失败：' + (error.message || '未知错误'))
  }
}

// 搜索
const handleSearch = async () => {
  pagination.value.page = 1
  await fetchContents()
}

// 重置
const handleReset = async () => {
  searchForm.value = {
    title: '',
    type: undefined,
    status: undefined
  }
  pagination.value.page = 1
  await fetchContents()
}

// 分页大小变化
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  await fetchContents()
}

// 当前页码变化
const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  fetchContents()
}

// 新增内容
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑内容
const handleEdit = (content: Content) => {
  isEdit.value = true
  Object.assign(formData, {
    id: content.id,
    title: content.title,
    type: content.type,
    content: content.content,
    status: content.status,
    sort: content.sort
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.title = ''
  formData.type = 'article'
  formData.content = ''
  formData.status = 'draft'
  formData.sort = 0
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value && formData.id) {
      const updateData: ContentUpdateRequest = {
        id: formData.id,
        title: formData.title,
        type: formData.type,
        content: formData.content,
        status: formData.status,
        sort: formData.sort
      }
      await updateContent(updateData)
      dialogVisible.value = false
      ElMessage.success('内容更新成功')
      await fetchContents()
    } else {
      const createData: ContentCreateRequest = {
        title: formData.title,
        type: formData.type,
        content: formData.content,
        status: formData.status,
        sort: formData.sort
      }
      await createContent(createData)
      dialogVisible.value = false
      ElMessage.success('内容创建成功')
      await fetchContents()
    }
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新内容失败' : '创建内容失败')
      console.error(error)
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除内容
const handleDelete = async (content: Content) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容「${content.title}」吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        showClose: false
      }
    )
    
    await deleteContent(content.id)
    await fetchContents()
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
      console.error('删除内容失败:', error)
    }
  }
}

// 页面加载时获取内容列表
onMounted(() => {
  fetchContents()
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