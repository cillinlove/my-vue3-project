// 订单状态类型
export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled'

// 订单状态值映射
export const OrderStatus = {
  PENDING_PAYMENT: 'pending_payment' as OrderStatus,
  PAID: 'paid' as OrderStatus,
  SHIPPED: 'shipped' as OrderStatus,
  COMPLETED: 'completed' as OrderStatus,
  CANCELLED: 'cancelled' as OrderStatus
}

// 订单项类型
export interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  image: string
}

// 订单类型
export interface Order {
  id: string
  orderNo: string
  userId: number
  userName: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  shippingAddress: string
  contactPhone: string
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

// 订单查询参数类型
export interface OrderQueryParams {
  status?: OrderStatus
  startTime?: string
  endTime?: string
  page: number
  pageSize: number
}

// 订单列表响应类型
export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}
