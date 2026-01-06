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
            <div class="chart-actions">
              <el-tag type="info" size="small" effect="plain">
                <el-icon><InfoFilled /></el-icon>
                实时数据
              </el-tag>
            </div>
          </div>
        </template>
        <div class="category-layout">
          <div class="chart-section">
            <div id="category-chart" class="chart-container"></div>
          </div>
          <div class="insights-section">
            <div class="insights-header">
              <el-icon><TrendCharts /></el-icon>
              <span>销售洞察</span>
            </div>
            <div class="insights-metrics">
              <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #409EFF, #67C23A);">
                  <el-icon><Medal /></el-icon>
                </div>
                <div class="metric-content">
                  <div class="metric-label">热销分类</div>
                  <div class="metric-value highlight">{{ statsData.topCategory }}</div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #E6A23C, #F56C6C);">
                  <el-icon><Grid /></el-icon>
                </div>
                <div class="metric-content">
                  <div class="metric-label">分类数量</div>
                  <div class="metric-value">{{ categoryData.length }} 个</div>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #909399, #409EFF);">
                  <el-icon><PieChart /></el-icon>
                </div>
                <div class="metric-content">
                  <div class="metric-label">最高占比</div>
                  <div class="metric-value">{{ getMaxPercentage() }}%</div>
                </div>
              </div>
            </div>
            <div class="breakdown-section">
              <div class="breakdown-header">
                <el-icon><List /></el-icon>
                <span>分类占比明细</span>
              </div>
              <div class="breakdown-list">
                <div 
                  v-for="(item, index) in categoryData" 
                  :key="item.category" 
                  class="breakdown-row"
                >
                  <div class="breakdown-info">
                    <span class="breakdown-dot" :style="{ background: getCategoryColor(index) }"></span>
                    <span class="breakdown-name">{{ item.category }}</span>
                  </div>
                  <div class="breakdown-bars">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ 
                          width: item.percentage + '%',
                          background: getCategoryColor(index)
                        }"
                      ></div>
                    </div>
                  </div>
                  <div class="breakdown-stats">
                    <span class="breakdown-percent">{{ item.percentage }}%</span>
                    <span class="breakdown-amount">¥{{ formatAmount(item.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="insight-tip">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ statsData.topCategory }}占总销售额的 {{ getCategoryPercentage(statsData.topCategory) }}%，建议重点关注库存管理</span>
            </div>
          </div>
        </div>
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
import { InfoFilled, TrendCharts, WarningFilled, Medal, Grid, PieChart, List } from '@element-plus/icons-vue'
import { getSalesData } from '../utils/api'

// 获取最大占比
const getMaxPercentage = () => {
  if (categoryData.value.length === 0) return 0
  return Math.max(...categoryData.value.map(item => item.percentage))
}

// 获取指定分类的占比
const getCategoryPercentage = (category: string) => {
  const item = categoryData.value.find(item => item.category === category)
  return item?.percentage.toFixed(1) || 0
}

// 获取分类颜色
const getCategoryColor = (index: number) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  return colors[index % colors.length]
}

// 格式化金额
const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + '万'
  }
  return amount.toLocaleString()
}

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
  
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
           <div style="padding: 8px;">
             <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
             <div>销售额: <span style="color: #409EFF; font-weight: 600;">¥${params.value.toLocaleString()}</span></div>
             <div>占比: <span style="color: #67C23A; font-weight: 600;">${params.percent}%</span></div>
           </div>
         `
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      }
    },
    legend: {
      orient: 'vertical',
      right: '3%',
      top: 'center',
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20,
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        color: '#303133',
        padding: [4, 0, 4, 10]
      },
      formatter: (name: string) => {
        const item = categoryData.value.find(d => d.category === name)
        const percent = item?.percentage || 0
        return `${name}\n${percent}%`
      }
    },
    series: [
      {
        name: '商品分类销售',
        type: 'pie',
        radius: ['48%', '75%'],
        center: ['45%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3
        },
        label: {
          show: true,
          position: 'outer',
          formatter: '{b}',
          fontSize: 13,
          fontWeight: 600,
          color: '#303133',
          lineHeight: 18
        },
        labelLine: {
          show: true,
          length: 25,
          length2: 20,
          smooth: 0.3,
          lineStyle: {
            color: '#909399',
            width: 1.5,
            type: 'solid'
          }
        },
        data: categoryData.value.map((item, index) => ({
          value: item.amount,
          name: item.category,
          percentage: item.percentage,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        emphasis: {
          scale: true,
          scaleSize: 12,
          itemStyle: {
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.25)'
          }
        }
      }
    ],
    labelLayout: {
      moveOverlap: 'shiftY',
      hideOverlap: true,
      y: 10,
      font: {
        size: 13,
        weight: 600
      }
    }
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

.chart-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.category-layout {
  display: flex;
  height: calc(100% - 50px);
  gap: var(--spacing-xl);
}

.chart-section {
  flex: 1;
  min-width: 0;
}

.chart-section .chart-container {
  width: 100%;
  height: 100%;
}

.insights-section {
  width: 260px;
  background: linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: var(--radius-lg);
  border: 1px solid #e4e7ed;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.insights-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #303133;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid #409EFF;
}

.insights-header .el-icon {
  color: #409EFF;
  font-size: 18px;
}

.insights-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.metric-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-value.highlight {
  color: #409EFF;
  font-size: var(--font-size-lg);
}

.breakdown-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #606266;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid #e4e7ed;
}

.breakdown-header .el-icon {
  color: #909399;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  overflow-y: auto;
  padding-right: var(--spacing-xs);
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.breakdown-info {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 70px;
  flex-shrink: 0;
}

.breakdown-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.breakdown-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breakdown-bars {
  flex: 1;
  min-width: 0;
}

.progress-bar {
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.breakdown-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 70px;
  flex-shrink: 0;
}

.breakdown-percent {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.breakdown-amount {
  font-size: 11px;
  color: #909399;
}

.insight-tip {
  margin-top: auto;
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.08) 0%, rgba(230, 162, 60, 0.08) 100%);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  border-left: 3px solid #E6A23C;
}

.insight-tip .el-icon {
  color: #E6A23C;
  flex-shrink: 0;
  margin-top: 2px;
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
    height: auto;
    min-height: 500px;
  }
  
  .category-layout {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .chart-section {
    height: 280px;
  }
  
  .insights-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .insights-header {
    width: 100%;
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid #e4e7ed;
  }
  
  .insights-metrics {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .metric-card {
    flex: 1;
    min-width: calc(33.33% - 8px);
  }
  
  .breakdown-section {
    width: 100%;
    max-height: 200px;
  }
  
  .insight-tip {
    width: 100%;
    margin-top: var(--spacing-sm);
  }
}
</style>