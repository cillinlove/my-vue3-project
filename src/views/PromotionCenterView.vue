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

    <!-- 新增/编辑促销活动弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑促销活动' : '新增促销活动'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="promotion-form"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入活动名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择活动类型" style="width: 100%">
            <el-option label="折扣" value="discount" />
            <el-option label="优惠券" value="coupon" />
            <el-option label="满减" value="rebate" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入活动描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优惠数值" prop="discountValue">
          <el-input-number
            v-model="formData.discountValue"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
          <span class="form-tip" v-if="formData.type === 'discount'">% (折扣百分比)</span>
          <span class="form-tip" v-else-if="formData.type === 'coupon'">元 (优惠券金额)</span>
          <span class="form-tip" v-else>元 (满减金额)</span>
        </el-form-item>

        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="formData.timeRange"
            type="datetimerange"
            :locale="zhCn"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="活动状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建活动' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageLayout from '../components/PageLayout.vue'
import type { Promotion, PromotionQueryParams, PromotionCreateRequest, PromotionUpdateRequest } from '../types/promotion'
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../utils/api'

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

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

// 表单数据
const formData = reactive({
  name: '',
  type: 'discount' as 'discount' | 'coupon' | 'rebate',
  description: '',
  discountValue: 0,
  timeRange: [] as [string, string] | [],
  status: 'active' as 'active' | 'inactive'
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '活动名称长度在 2-50 个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ],
  discountValue: [
    { required: true, message: '请输入优惠数值', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '优惠数值必须在 0-100 之间', trigger: 'blur' }
  ],
  timeRange: [
    { required: true, message: '请选择活动时间', trigger: 'change', type: 'array' }
  ],
  status: [
    { required: true, message: '请选择活动状态', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.type = 'discount'
  formData.description = ''
  formData.discountValue = 0
  formData.timeRange = []
  formData.status = 'active'
  editingId.value = null
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = async (promotion: Promotion) => {
  isEdit.value = true
  editingId.value = promotion.id
  formData.name = promotion.name
  formData.type = promotion.type
  formData.description = promotion.description
  formData.discountValue = promotion.discountValue
  formData.timeRange = [promotion.startTime, promotion.endTime]
  formData.status = promotion.status === 'expired' ? 'inactive' : promotion.status
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    
    try {
      if (isEdit.value && editingId.value !== null) {
        // 编辑模式
        if (!formData.timeRange[0] || !formData.timeRange[1]) {
          ElMessage.error('请选择完整的时间范围')
          submitLoading.value = false
          return
        }
        const updateData: PromotionUpdateRequest = {
          id: editingId.value,
          name: formData.name,
          type: formData.type,
          description: formData.description,
          discountValue: formData.discountValue,
          startTime: formData.timeRange[0],
          endTime: formData.timeRange[1],
          status: formData.status
        }
        
        await updatePromotion(updateData)
        ElMessage.success('修改促销活动成功')
      } else {
        // 新增模式
        if (!formData.timeRange[0] || !formData.timeRange[1]) {
          ElMessage.error('请选择完整的时间范围')
          submitLoading.value = false
          return
        }
        const createData: PromotionCreateRequest = {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          discountValue: formData.discountValue,
          startTime: formData.timeRange[0],
          endTime: formData.timeRange[1]
        }
        
        await createPromotion(createData)
        ElMessage.success('创建促销活动成功')
      }
      
      dialogVisible.value = false
      await fetchPromotions()
    } catch (error: any) {
      ElMessage.error(isEdit.value ? '修改失败：' : '创建失败：' + (error.message || '未知错误'))
    } finally {
      submitLoading.value = false
    }
  })
}

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

/* 促销活动表单样式 */
.promotion-form {
  padding: var(--spacing-md) 0;
}

.form-tip {
  margin-left: var(--spacing-sm);
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}

.promotion-form :deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

.promotion-form :deep(.el-textarea .el-input__count) {
  background: transparent;
}
</style>