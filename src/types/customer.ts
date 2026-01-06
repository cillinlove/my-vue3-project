export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  company?: string
  address: string
  level: CustomerLevel
  status: CustomerStatus
  totalOrders: number
  totalSpent: number
  lastOrderTime?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  notes?: string
}

export type CustomerLevel = 'regular' | 'silver' | 'gold' | 'platinum'
export type CustomerStatus = 'active' | 'inactive' | 'blocked'

export interface CustomerCreateRequest {
  name: string
  email: string
  phone: string
  company?: string
  address: string
  level?: CustomerLevel
  tags?: string[]
  notes?: string
}

export interface CustomerUpdateRequest {
  id: number
  name: string
  email: string
  phone: string
  company?: string
  address: string
  level: CustomerLevel
  status: CustomerStatus
  tags: string[]
  notes?: string
}

export interface CustomerQueryParams {
  name?: string
  email?: string
  phone?: string
  level?: CustomerLevel
  status?: CustomerStatus
  tags?: string[]
  page: number
  pageSize: number
}

export interface CustomerListResponse {
  list: Customer[]
  total: number
  page: number
  pageSize: number
}

export const CustomerLevelOptions = [
  { value: 'regular', label: '普通客户', color: '#909399' },
  { value: 'silver', label: '银牌客户', color: '#C0C4CC' },
  { value: 'gold', label: '金牌客户', color: '#E6A23C' },
  { value: 'platinum', label: '铂金客户', color: '#409EFF' }
]

export const CustomerStatusOptions = [
  { value: 'active', label: '正常', type: 'success' },
  { value: 'inactive', label: '不活跃', type: 'warning' },
  { value: 'blocked', label: '已禁用', type: 'danger' }
]
