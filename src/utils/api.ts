import type { Product, ProductCategory, ProductListResponse, ProductQueryParams, ProductCreateRequest, ProductUpdateRequest } from '../types/product'
import { OrderStatus } from '../types/order'
import type { Order, OrderListResponse, OrderQueryParams } from '../types/order'
import type { SalesDataResponse } from '../types/sales'
import type { User, UserListResponse, UserQueryParams, UserCreateRequest, UserUpdateRequest } from '../types/user'
import type { Promotion, PromotionListResponse, PromotionQueryParams, PromotionCreateRequest, PromotionUpdateRequest } from '../types/promotion'
import type { Content, ContentListResponse, ContentQueryParams, ContentCreateRequest, ContentUpdateRequest } from '../types/content'
import type { ProcurementOrder, ProcurementListResponse, ProcurementQueryParams, ProcurementCreateRequest, ProcurementUpdateRequest } from '../types/procurement'
import type { Warehouse, Inventory, WarehouseListResponse, InventoryListResponse, WarehouseQueryParams, InventoryQueryParams, WarehouseCreateRequest, WarehouseUpdateRequest, InventoryCreateRequest, InventoryUpdateRequest } from '../types/wms'
import type { DispatchTask, DispatchListResponse, DispatchQueryParams, DispatchCreateRequest, DispatchUpdateRequest } from '../types/dispatch'
import type { LogisticsInfo, LogisticsListResponse, LogisticsQueryParams, LogisticsCreateRequest, LogisticsUpdateRequest } from '../types/logistics'
import type { Permission, PermissionListResponse, PermissionQueryParams, PermissionCreateRequest, PermissionUpdateRequest } from '../types/permission'
import type { Role, RoleListResponse, RoleQueryParams, CreateRoleRequest, UpdateRoleRequest, AssignRoleRequest, AssignPermissionRequest, UserPermission } from '../types/role'

// 真实API基础地址
export const API_BASE_URL = 'https://www.study.com/api'

// 导入模拟数据函数
import * as mockData from './mockData'

// ==========================================
// 商品管理模块
// ==========================================

// 获取商品列表
export async function getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/products', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getProducts(params)
}

// 创建商品
export async function createProduct(data: ProductCreateRequest): Promise<Product> {
  // 记录真实API地址
  const fullUrl = new URL('/products', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createProduct(data)
}

// 更新商品
export async function updateProduct(data: ProductUpdateRequest): Promise<Product> {
  // 记录真实API地址
  const fullUrl = new URL(`/products/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateProduct(data)
}

// 删除商品
export async function deleteProduct(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/products/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteProduct(id)
}

// 商品分类列表
export async function getCategories(): Promise<ProductCategory[]> {
  // 记录真实API地址
  const fullUrl = new URL('/categories', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.categories
}

// 上传图片
export async function uploadImage(file: File): Promise<string> {
  // 记录真实API地址
  const fullUrl = new URL('/upload/image', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.uploadImage(file)
}

// ==========================================
// 订单管理模块
// ==========================================

// 获取订单列表
export async function getOrders(params: OrderQueryParams): Promise<OrderListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/orders', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getOrders(params)
}

// 获取订单详情
export async function getOrderDetail(orderId: string): Promise<Order> {
  // 记录真实API地址
  const fullUrl = new URL(`/orders/${orderId}`, API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`)
  
  // 使用模拟数据 - 简单实现
  const orders = mockData.getOrders({ page: 1, pageSize: 100 })
  return orders.list.find(order => order.id === orderId) as Order
}

// 更新订单状态
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  // 记录真实API地址
  const fullUrl = new URL(`/orders/${orderId}/status`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { status })
  
  // 使用模拟数据
  return mockData.updateOrderStatus(orderId, status)
}

// ==========================================
// 销售报表模块
// ==========================================

// 获取销售数据
export async function getSalesData(): Promise<SalesDataResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/sales/data', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.getSalesData()
}

// ==========================================
// 用户中心模块
// ==========================================

// 获取用户列表
export async function getUsers(params: UserQueryParams): Promise<UserListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/users', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getUsers(params)
}

// 创建用户
export async function createUser(data: UserCreateRequest): Promise<User> {
  // 记录真实API地址
  const fullUrl = new URL('/users', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createUser(data)
}

// 更新用户
export async function updateUser(data: UserUpdateRequest): Promise<User> {
  // 记录真实API地址
  const fullUrl = new URL(`/users/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateUser(data)
}

// 删除用户
export async function deleteUser(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/users/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteUser(id)
}

// ==========================================
// 促销中心模块
// ==========================================

// 获取促销活动列表
export async function getPromotions(params: PromotionQueryParams): Promise<PromotionListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/promotions', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getPromotions(params)
}

// 创建促销活动
export async function createPromotion(data: PromotionCreateRequest): Promise<Promotion> {
  // 记录真实API地址
  const fullUrl = new URL('/promotions', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createPromotion(data)
}

// 更新促销活动
export async function updatePromotion(data: PromotionUpdateRequest): Promise<Promotion> {
  // 记录真实API地址
  const fullUrl = new URL(`/promotions/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updatePromotion(data)
}

// 删除促销活动
export async function deletePromotion(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/promotions/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deletePromotion(id)
}

// ==========================================
// 内容管理模块
// ==========================================

// 获取内容列表
export async function getContents(params: ContentQueryParams): Promise<ContentListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/contents', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getContents(params)
}

// 创建内容
export async function createContent(data: ContentCreateRequest): Promise<Content> {
  // 记录真实API地址
  const fullUrl = new URL('/contents', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createContent(data)
}

// 更新内容
export async function updateContent(data: ContentUpdateRequest): Promise<Content> {
  // 记录真实API地址
  const fullUrl = new URL(`/contents/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateContent(data)
}

// 删除内容
export async function deleteContent(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/contents/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteContent(id)
}

// ==========================================
// 采购管理模块
// ==========================================

// 获取采购订单列表
export async function getProcurements(params: ProcurementQueryParams): Promise<ProcurementListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/procurements', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getProcurementOrders(params)
}

// 创建采购订单
export async function createProcurement(data: ProcurementCreateRequest): Promise<ProcurementOrder> {
  // 记录真实API地址
  const fullUrl = new URL('/procurements', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createProcurementOrder(data)
}

// 更新采购订单
export async function updateProcurement(data: ProcurementUpdateRequest): Promise<ProcurementOrder> {
  // 记录真实API地址
  const fullUrl = new URL(`/procurements/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateProcurementOrder(data)
}

// 删除采购订单
export async function deleteProcurement(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/procurements/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteProcurementOrder(id)
}

// ==========================================
// 仓储管理模块
// ==========================================

// 获取仓库列表
export async function getWarehouses(params: WarehouseQueryParams): Promise<WarehouseListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/warehouses', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getWarehouses(params)
}

// 创建仓库
export async function createWarehouse(data: WarehouseCreateRequest): Promise<Warehouse> {
  // 记录真实API地址
  const fullUrl = new URL('/warehouses', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createWarehouse(data)
}

// 更新仓库
export async function updateWarehouse(data: WarehouseUpdateRequest): Promise<Warehouse> {
  // 记录真实API地址
  const fullUrl = new URL(`/warehouses/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateWarehouse(data)
}

// 删除仓库
export async function deleteWarehouse(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/warehouses/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteWarehouse(id)
}

// 获取库存列表
export async function getInventory(params: InventoryQueryParams): Promise<InventoryListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/inventory', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getInventory(params)
}

// 创建库存记录
export async function createInventory(data: InventoryCreateRequest): Promise<Inventory> {
  // 记录真实API地址
  const fullUrl = new URL('/inventory', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createInventory(data)
}

// 更新库存记录
export async function updateInventory(data: InventoryUpdateRequest): Promise<Inventory> {
  // 记录真实API地址
  const fullUrl = new URL(`/inventory/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateInventory(data)
}

// 删除库存记录
export async function deleteInventory(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/inventory/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteInventory(id)
}

// ==========================================
// 配送管理模块
// ==========================================

// 获取配送任务列表
export async function getDispatches(params: DispatchQueryParams): Promise<DispatchListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/dispatches', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getDispatchTasks(params)
}

// 创建配送任务
export async function createDispatch(data: DispatchCreateRequest): Promise<DispatchTask> {
  // 记录真实API地址
  const fullUrl = new URL('/dispatches', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createDispatchTask(data)
}

// 更新配送任务
export async function updateDispatch(data: DispatchUpdateRequest): Promise<DispatchTask> {
  // 记录真实API地址
  const fullUrl = new URL(`/dispatches/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateDispatchTask(data)
}

// 删除配送任务
export async function deleteDispatch(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/dispatches/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteDispatchTask(id)
}

// ==========================================
// 物流管理模块
// ==========================================

// 获取物流信息列表
export async function getLogistics(params: LogisticsQueryParams): Promise<LogisticsListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/logistics', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getLogisticsInfo(params)
}

// 创建物流信息
export async function createLogistics(data: LogisticsCreateRequest): Promise<LogisticsInfo> {
  // 记录真实API地址
  const fullUrl = new URL('/logistics', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createLogisticsInfo(data)
}

// 更新物流信息
export async function updateLogistics(data: LogisticsUpdateRequest): Promise<LogisticsInfo> {
  // 记录真实API地址
  const fullUrl = new URL(`/logistics/${data.id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateLogisticsInfo(data)
}

// 删除物流信息
export async function deleteLogistics(id: number): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/logistics/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteLogisticsInfo(id)
}

// ==========================================
// 认证模块
// ==========================================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userInfo: {
    id: number
    username: string
    role: string
  }
  expiresIn: number
}

// 用户登录
export async function login(params: LoginRequest): Promise<LoginResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/auth/login', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  // 模拟登录成功响应
  return {
    token: 'mock-jwt-token-' + Date.now(),
    userInfo: {
      id: 1,
      username: params.username,
      role: 'admin'
    },
    expiresIn: 3600
  }
}

// 用户登出
export async function logout(): Promise<void> {
  // 记录真实API地址
  const fullUrl = new URL('/auth/logout', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`)
  
  // 清除本地存储的token
  localStorage.removeItem('auth_token')
  return Promise.resolve()
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<User> {
  // 记录真实API地址
  const fullUrl = new URL('/auth/me', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    roleId: 'admin-role-id',
    permissions: ['dashboard_view', 'product_view', 'product_create', 'user_view', 'order_view'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ==========================================
// 权限管理模块
// ==========================================

// 获取权限列表
export async function getPermissions(params: PermissionQueryParams): Promise<PermissionListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/permissions', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getPermissions(params)
}

// 创建权限
export async function createPermission(data: PermissionCreateRequest): Promise<Permission> {
  // 记录真实API地址
  const fullUrl = new URL('/permissions', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createPermission(data)
}

// 更新权限
export async function updatePermission(id: string, data: PermissionUpdateRequest): Promise<Permission> {
  // 记录真实API地址
  const fullUrl = new URL(`/permissions/${id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updatePermission(id, data)
}

// 删除权限
export async function deletePermission(id: string): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/permissions/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deletePermission(id)
}

// 切换权限状态
export async function togglePermissionStatus(id: string, status: boolean): Promise<Permission> {
  // 记录真实API地址
  const fullUrl = new URL(`/permissions/${id}/status`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { status })
  
  // 使用模拟数据
  return mockData.updatePermissionStatus(id, status)
}

// ==========================================
// 角色管理模块
// ==========================================

// 获取角色列表
export async function getRoles(params: RoleQueryParams): Promise<RoleListResponse> {
  // 记录真实API地址
  const fullUrl = new URL('/roles', API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`, { params })
  
  // 使用模拟数据
  return mockData.getRoles(params)
}

// 创建角色
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  // 记录真实API地址
  const fullUrl = new URL('/roles', API_BASE_URL)
  console.log(`API Call: POST ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.createRole(data)
}

// 更新角色
export async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  // 记录真实API地址
  const fullUrl = new URL(`/roles/${id}`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.updateRole(id, data)
}

// 删除角色
export async function deleteRole(id: string): Promise<boolean> {
  // 记录真实API地址
  const fullUrl = new URL(`/roles/${id}`, API_BASE_URL)
  console.log(`API Call: DELETE ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.deleteRole(id)
}

// 切换角色状态
export async function toggleRoleStatus(id: string, status: boolean): Promise<Role> {
  // 记录真实API地址
  const fullUrl = new URL(`/roles/${id}/status`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { status })
  
  // 使用模拟数据
  return mockData.updateRoleStatus(id, status)
}

// ==========================================
// 用户权限分配模块
// ==========================================

// 获取用户权限
export async function getUserPermissions(userId: number): Promise<UserPermission | undefined> {
  // 记录真实API地址
  const fullUrl = new URL(`/users/${userId}/permissions`, API_BASE_URL)
  console.log(`API Call: GET ${fullUrl.toString()}`)
  
  // 使用模拟数据
  return mockData.getUserPermissions(userId)
}

// 分配用户权限
export async function assignUserPermissions(data: AssignPermissionRequest): Promise<UserPermission> {
  // 记录真实API地址
  const fullUrl = new URL(`/users/${data.userId}/permissions`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  return mockData.assignUserPermissions(data.userId, data.permissionIds)
}

// 分配用户角色
export async function assignUserRole(data: AssignRoleRequest): Promise<void> {
  // 记录真实API地址
  const fullUrl = new URL(`/users/${data.userId}/role`, API_BASE_URL)
  console.log(`API Call: PUT ${fullUrl.toString()}`, { data })
  
  // 使用模拟数据
  mockData.assignUserRole(data.userId, data.roleId)
  return Promise.resolve()
}