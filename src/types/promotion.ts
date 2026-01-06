export interface Promotion {
  id: number
  name: string
  type: 'discount' | 'coupon' | 'rebate'
  description: string
  status: 'active' | 'inactive' | 'expired'
  startTime: string
  endTime: string
  discountValue: number
  createdAt: string
  updatedAt: string
}

export interface PromotionCreateRequest {
  name: string
  type: 'discount' | 'coupon' | 'rebate'
  description: string
  startTime: string
  endTime: string
  discountValue: number
}

export interface PromotionUpdateRequest {
  id: number
  name: string
  type: 'discount' | 'coupon' | 'rebate'
  description: string
  status: 'active' | 'inactive' | 'expired'
  startTime: string
  endTime: string
  discountValue: number
}

export interface PromotionQueryParams {
  name?: string
  type?: 'discount' | 'coupon' | 'rebate'
  status?: 'active' | 'inactive' | 'expired'
  page: number
  pageSize: number
}

export interface PromotionListResponse {
  list: Promotion[]
  total: number
  page: number
  pageSize: number
}