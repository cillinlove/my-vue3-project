export interface LogisticsInfo {
  id: number
  orderId: number
  logisticsNo: string
  carrierName: string
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned'
  trackingUrl: string
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  createdAt: string
  updatedAt: string
}

export interface LogisticsTrack {
  id: number
  logisticsId: number
  location: string
  description: string
  status: string
  trackTime: string
}

export interface LogisticsCreateRequest {
  orderId: number
  logisticsNo: string
  carrierName: string
  trackingUrl: string
  estimatedDeliveryDate: string
}

export interface LogisticsUpdateRequest {
  id: number
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned'
  actualDeliveryDate?: string
}

export interface LogisticsQueryParams {
  logisticsNo?: string
  orderId?: number
  carrierName?: string
  status?: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned'
  page: number
  pageSize: number
}

export interface LogisticsListResponse {
  list: LogisticsInfo[]
  total: number
  page: number
  pageSize: number
}