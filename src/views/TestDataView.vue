<template>
  <PageLayout 
    title="数据测试页面" 
    :actions="[
      { type: 'primary', text: '测试订单数据', onClick: testOrdersData },
      { type: 'primary', text: '测试销售数据', onClick: testSalesData }
    ]"
  >
    <div class="test-result">
      <h3>测试结果:</h3>
      <pre>{{ testResult }}</pre>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '../components/PageLayout.vue'
import { getOrders, getSalesData } from '../utils/mockData'
import type { OrderQueryParams } from '../types/order'

const testResult = ref('')

// 测试订单数据
const testOrdersData = () => {
  try {
    const params: OrderQueryParams = {
      page: 1,
      pageSize: 10
    }
    
    const result = getOrders(params)
    testResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    testResult.value = `错误: ${error}`
  }
}

// 测试销售数据
const testSalesData = async () => {
  try {
    const result = await getSalesData()
    testResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    testResult.value = `错误: ${error}`
  }
}
</script>

<style scoped>


.test-result {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  max-height: 500px;
  overflow-y: auto;
}
</style>