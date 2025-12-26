export interface DispatchTask {
  id: number
  taskNo: string
  orderId: number
  warehouseId: number
  warehouseName: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  requiredQuantity: number
  dispatchedQuantity: number
  operator?: string
  startTime?: string
  endTime?: string
  createdAt: string
  updatedAt: string
}

export interface DispatchTaskItem {
  id: number
  taskId: number
  productName: string
  sku: string
  quantity: number
  location: string
}

export interface DispatchCreateRequest {
  orderId: number
  warehouseId: number
  priority: 'low' | 'medium' | 'high'
  requiredQuantity: number
  items: Omit<DispatchTaskItem, 'id' | 'taskId'>[]
}

export interface DispatchUpdateRequest {
  id: number
  orderId?: number
  warehouseId?: number
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  requiredQuantity?: number
  dispatchedQuantity?: number
  operator?: string
  startTime?: string
  endTime?: string
}

export interface DispatchQueryParams {
  taskNo?: string
  orderId?: number
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  priority?: 'low' | 'medium' | 'high'
  page: number
  pageSize: number
}

export interface DispatchListResponse {
  list: DispatchTask[]
  total: number
  page: number
  pageSize: number
}