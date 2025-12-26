export interface ProcurementOrder {
  id: number
  orderNo: string
  supplierName: string
  totalAmount: number
  status: 'pending' | 'approved' | 'purchased' | 'completed' | 'cancelled'
  orderDate: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  createdAt: string
  updatedAt: string
}

export interface ProcurementOrderItem {
  id: number
  orderId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ProcurementCreateRequest {
  supplierName: string
  totalAmount: number
  orderDate: string
  expectedDeliveryDate: string
  items: Omit<ProcurementOrderItem, 'id' | 'orderId' | 'totalPrice'>[]
}

export interface ProcurementUpdateRequest {
  id: number
  supplierName: string
  totalAmount: number
  status: 'pending' | 'approved' | 'purchased' | 'completed' | 'cancelled'
  expectedDeliveryDate: string
  actualDeliveryDate?: string
}

export interface ProcurementQueryParams {
  orderNo?: string
  supplierName?: string
  status?: 'pending' | 'approved' | 'purchased' | 'completed' | 'cancelled'
  page: number
  pageSize: number
}

export interface ProcurementListResponse {
  list: ProcurementOrder[]
  total: number
  page: number
  pageSize: number
}