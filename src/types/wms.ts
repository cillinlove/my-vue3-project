export interface Warehouse {
  id: number
  name: string
  address: string
  manager: string
  phone: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Inventory {
  id: number
  warehouseId: number
  warehouseName: string
  productName: string
  sku: string
  quantity: number
  minStock: number
  maxStock: number
  status: 'normal' | 'low' | 'high'
  updatedAt: string
}

export interface WarehouseCreateRequest {
  name: string
  address: string
  manager: string
  phone: string
}

export interface WarehouseUpdateRequest {
  id: number
  name: string
  address: string
  manager: string
  phone: string
  status: 'active' | 'inactive'
}

export interface InventoryCreateRequest {
  warehouseId: number
  productName: string
  sku: string
  quantity: number
  minStock: number
  maxStock: number
}

export interface InventoryUpdateRequest {
  id: number
  warehouseId: number
  productName: string
  sku: string
  quantity: number
  minStock: number
  maxStock: number
}

export interface WarehouseQueryParams {
  name?: string
  status?: 'active' | 'inactive'
  page: number
  pageSize: number
}

export interface InventoryQueryParams {
  productName?: string
  sku?: string
  warehouseId?: number
  status?: 'normal' | 'low' | 'high'
  page: number
  pageSize: number
}

export interface WarehouseListResponse {
  list: Warehouse[]
  total: number
  page: number
  pageSize: number
}

export interface InventoryListResponse {
  list: Inventory[]
  total: number
  page: number
  pageSize: number
}