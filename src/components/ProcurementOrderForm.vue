<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
    class="procurement-form"
  >
    <el-form-item label="供应商" prop="supplierName">
      <el-input
        v-model="formData.supplierName"
        placeholder="请输入供应商名称"
        clearable
      />
    </el-form-item>

    <el-form-item label="订单日期" prop="orderDate">
      <el-date-picker
        v-model="formData.orderDate"
        type="date"
        placeholder="请选择订单日期"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="预计交货日期" prop="expectedDeliveryDate">
      <el-date-picker
        v-model="formData.expectedDeliveryDate"
        type="date"
        placeholder="请选择预计交货日期"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="订单金额" prop="totalAmount">
      <el-input-number
        v-model="formData.totalAmount"
        :precision="2"
        :min="0"
        :step="100"
        :max="99999999"
        placeholder="请输入订单金额"
        style="width: 100%"
      />
    </el-form-item>

    <template v-if="isEdit">
      <el-form-item label="订单状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="请选择订单状态"
          style="width: 100%"
        >
          <el-option label="待审批" value="pending" />
          <el-option label="已审批" value="approved" />
          <el-option label="已采购" value="purchased" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="实际交货日期" prop="actualDeliveryDate">
        <el-date-picker
          v-model="formData.actualDeliveryDate"
          type="date"
          placeholder="请选择实际交货日期（可选）"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          clearable
        />
      </el-form-item>
    </template>

    <el-form-item label="备注">
      <el-input
        v-model="formData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息（可选）"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ProcurementOrder, ProcurementCreateRequest, ProcurementUpdateRequest } from '../types/procurement'

const props = defineProps<{
  order?: ProcurementOrder
  isEdit: boolean
}>()

const emit = defineEmits<{
  (e: 'update:formData', data: ProcurementCreateRequest | ProcurementUpdateRequest): void
}>()

const formRef = ref<FormInstance>()

type StatusType = 'pending' | 'approved' | 'purchased' | 'completed' | 'cancelled'

const formData = reactive({
  supplierName: '',
  orderDate: '',
  expectedDeliveryDate: '',
  totalAmount: 0,
  status: 'pending' as StatusType,
  actualDeliveryDate: '',
  remark: ''
})

const formRules: FormRules = {
  supplierName: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 100, message: '供应商名称长度在2-100个字符之间', trigger: 'blur' }
  ],
  orderDate: [
    { required: true, message: '请选择订单日期', trigger: 'change' }
  ],
  expectedDeliveryDate: [
    { required: true, message: '请选择预计交货日期', trigger: 'change' }
  ],
  totalAmount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: number, callback: (error?: Error) => void) => {
        if (value < 0) {
          callback(new Error('订单金额不能为负数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

watch(
  () => props.order,
  (newOrder) => {
    if (newOrder && props.isEdit) {
      formData.supplierName = newOrder.supplierName
      formData.orderDate = newOrder.orderDate
      formData.expectedDeliveryDate = newOrder.expectedDeliveryDate
      formData.totalAmount = newOrder.totalAmount
      formData.status = newOrder.status
      formData.actualDeliveryDate = newOrder.actualDeliveryDate || ''
      formData.remark = ''
    }
  },
  { immediate: true }
)

watch(formData, () => {
  emitFormData()
}, { deep: true })

const emitFormData = () => {
  if (props.isEdit && props.order) {
    emit('update:formData', {
      id: props.order.id,
      supplierName: formData.supplierName,
      totalAmount: formData.totalAmount,
      status: formData.status,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      actualDeliveryDate: formData.actualDeliveryDate || undefined
    } as ProcurementUpdateRequest)
  } else {
    emit('update:formData', {
      supplierName: formData.supplierName,
      totalAmount: formData.totalAmount,
      orderDate: formData.orderDate,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      items: []
    } as ProcurementCreateRequest)
  }
}

const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  return await formRef.value.validate().then(() => true).catch(() => false)
}

const resetForm = () => {
  formRef.value?.resetFields()
  formData.supplierName = ''
  formData.orderDate = ''
  formData.expectedDeliveryDate = ''
  formData.totalAmount = 0
  formData.status = 'pending'
  formData.actualDeliveryDate = ''
  formData.remark = ''
}

defineExpose({
  validate,
  resetForm
})
</script>

<style scoped>
.procurement-form {
  padding: var(--spacing-md) 0;
}
</style>
