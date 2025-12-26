<template>
  <PageLayout 
    title="销售数据仪表盘" 
    :showRefresh="true"
    :onRefresh="refreshData"
  >
    
    <!-- 销售统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总销售额</div>
          <div class="stat-value">¥{{ statsData.totalSales.toLocaleString() }}</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">平均销售额</div>
          <div class="stat-value">¥{{ statsData.averageSales.toLocaleString() }}</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ statsData.totalOrders }}</div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">热销分类</div>
          <div class="stat-value">{{ statsData.topCategory }}</div>
        </div>
      </el-card>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 销售趋势折线图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>近30天销售趋势</span>
            <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
          </div>
        </template>
        <div id="trend-chart" class="chart-container"></div>
      </el-card>
      
      <!-- 商品分类销售饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span>商品分类销售分布</span>
          </div>
        </template>
        <div id="category-chart" class="chart-container"></div>
      </el-card>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageLayout from '../components/PageLayout.vue'
import * as echarts from 'echarts'
import type { EChartsOption, ECharts } from 'echarts'
import type { SalesTrendData, CategorySalesData, SalesStatsData } from '../types/sales'
import { getSalesData } from '../utils/api'

// 销售数据
const statsData = ref<SalesStatsData>({
  totalSales: 0,
  averageSales: 0,
  totalOrders: 0,
  topCategory: ''
})

const trendData = ref<SalesTrendData[]>([])
const categoryData = ref<CategorySalesData[]>([])

// 图表实例
let trendChart: ECharts | null = null
let categoryChart: ECharts | null = null

// 加载销售数据
const loadSalesData = async () => {
  try {
    const data = await getSalesData()
    statsData.value = data.statsData
    trendData.value = data.trendData
    categoryData.value = data.categoryData
    
    // 更新图表
    updateTrendChart()
    updateCategoryChart()
  } catch (error) {
    ElMessage.error('加载销售数据失败')
    console.error('加载销售数据失败:', error)
  }
}

// 刷新数据
const refreshData = () => {
  ElMessage.info('正在刷新数据...')
  loadSalesData().then(() => {
    ElMessage.success('数据刷新成功')
  })
}

// 初始化销售趋势图表
const initTrendChart = () => {
  const chartDom = document.getElementById('trend-chart')
  if (!chartDom) return
  
  trendChart = echarts.init(chartDom)
  updateTrendChart()
}

// 更新销售趋势图表
const updateTrendChart = () => {
  if (!trendChart || trendData.value.length === 0) return
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销售额: ¥{c.toLocaleString()}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.map(item => item.date),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: trendData.value.map(item => item.amount),
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.05)'
            }
          ])
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化商品分类销售图表
const initCategoryChart = () => {
  const chartDom = document.getElementById('category-chart')
  if (!chartDom) return
  
  categoryChart = echarts.init(chartDom)
  updateCategoryChart()
}

// 更新商品分类销售图表
const updateCategoryChart = () => {
  if (!categoryChart || categoryData.value.length === 0) return
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c.toLocaleString()} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      formatter: (name) => {
        const item = categoryData.value.find(item => item.category === name)
        return `${name} (¥${item?.amount.toLocaleString() || 0})`
      }
    },
    series: [
      {
        name: '商品分类销售',
        type: 'pie',
        radius: '50%',
        data: categoryData.value.map(item => ({
          value: item.amount,
          name: item.category
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
  
  categoryChart.setOption(option)
}

// 窗口大小变化时调整图表大小
const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
}

// 页面挂载时初始化
onMounted(() => {
  loadSalesData()
  setTimeout(() => {
    initTrendChart()
    initCategoryChart()
    window.addEventListener('resize', handleResize)
  }, 0)
})

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.sales-dashboard {
  padding: var(--spacing-xl);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  height: 150px;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: var(--spacing-lg);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.chart-card {
  height: 450px;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  padding: 0;
}

.chart-container {
  width: 100%;
  height: calc(100% - 50px);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

@media (max-width: 768px) {
  .sales-dashboard {
    padding: var(--spacing-lg);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .stat-card {
    height: 130px;
  }
  
  .chart-card {
    height: 400px;
  }
}
</style>