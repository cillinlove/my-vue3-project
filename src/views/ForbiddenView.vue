<template>
  <div class="forbidden-page">
    <div class="forbidden-container">
      <div class="error-code">403</div>
      <div class="error-title">访问被拒绝</div>
      <div class="error-description">
        抱歉，您没有权限访问该页面。
        如果您认为这是一个错误，请联系管理员。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
  ElMessage.success('已返回首页')
}
</script>

<style scoped>
.forbidden-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forbidden-container {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 20px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 40px;
}

.error-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .forbidden-container {
    padding: 40px 30px;
    margin: 10px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>