// 销售趋势数据类型
export interface SalesTrendData {
  date: string
  amount: number
}

// 商品分类销售数据类型
export interface CategorySalesData {
  category: string
  amount: number
  percentage: number
}

// 销售统计数据类型
export interface SalesStatsData {
  totalSales: number
  averageSales: number
  totalOrders: number
  topCategory: string
}

// 销售数据响应类型
export interface SalesDataResponse {
  trendData: SalesTrendData[]
  categoryData: CategorySalesData[]
  statsData: SalesStatsData
}
