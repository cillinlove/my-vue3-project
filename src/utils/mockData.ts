import type { Product, ProductCategory, ProductListResponse, ProductQueryParams, ProductCreateRequest, ProductUpdateRequest } from '../types/product'
import { OrderStatus } from '../types/order'
import type { Order, OrderItem, OrderListResponse, OrderQueryParams } from '../types/order'
import type { SalesTrendData, CategorySalesData, SalesStatsData, SalesDataResponse } from '../types/sales'
import type { User, UserListResponse, UserQueryParams, UserCreateRequest, UserUpdateRequest } from '../types/user'
import type { Promotion, PromotionListResponse, PromotionQueryParams, PromotionCreateRequest, PromotionUpdateRequest } from '../types/promotion'
import type { Content, ContentListResponse, ContentQueryParams, ContentCreateRequest, ContentUpdateRequest } from '../types/content'
import type { ProcurementOrder, ProcurementListResponse, ProcurementQueryParams, ProcurementCreateRequest, ProcurementUpdateRequest } from '../types/procurement'
import type { Warehouse, Inventory, WarehouseListResponse, InventoryListResponse, WarehouseQueryParams, InventoryQueryParams, WarehouseCreateRequest, WarehouseUpdateRequest, InventoryCreateRequest, InventoryUpdateRequest } from '../types/wms'
import type { DispatchTask, DispatchListResponse, DispatchQueryParams, DispatchCreateRequest, DispatchUpdateRequest } from '../types/dispatch'
import type { LogisticsInfo, LogisticsListResponse, LogisticsQueryParams, LogisticsCreateRequest, LogisticsUpdateRequest } from '../types/logistics'
import type { Permission, PermissionListResponse, PermissionQueryParams, PermissionCreateRequest, PermissionUpdateRequest } from '../types/permission'
import type { Role, RoleListResponse, RoleQueryParams, RoleCreateRequest, RoleUpdateRequest, UserPermission } from '../types/role'
import type { Customer, CustomerLevel, CustomerQueryParams, CustomerListResponse, CustomerCreateRequest, CustomerUpdateRequest, CustomerStatus } from '../types/customer'

// 模拟商品分类数据
export const categories: ProductCategory[] = [
  { id: 1, name: '电子产品' },
  { id: 2, name: '家居用品' },
  { id: 3, name: '服装鞋帽' },
  { id: 4, name: '食品饮料' },
  { id: 5, name: '图书文具' }
]

// 生成随机商品数据
function generateMockProducts(count: number): Product[] {
  const products: Product[] = []
  const productNames = [
    '智能手机', '平板电脑', '笔记本电脑', '智能手表', '无线耳机',
    '电视', '冰箱', '洗衣机', '空调', '微波炉',
    '床', '沙发', '衣柜', '餐桌', '椅子',
    'T恤', '牛仔裤', '衬衫', '外套', '鞋子',
    '面包', '牛奶', '水果', '蔬菜', '饮料',
    '小说', '教材', '笔记本', '笔', '文件夹'
  ]

  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]! // 非空断言
    // 生成1-3张随机图片
    const imageCount = Math.floor(Math.random() * 3) + 1
    const images = Array.from({ length: imageCount }, (_, j) => 
      `https://picsum.photos/id/${i + j}/400/300`
    )
    
    products.push({
      id: i,
      name: `${productNames[i % productNames.length]} ${i}`,
      price: Math.floor(Math.random() * 9999) + 100,
      stock: Math.floor(Math.random() * 1000),
      category: category.id,
      categoryName: category.name,
      images: images,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }

  return products
}

// 模拟商品数据
let mockProducts = generateMockProducts(100)
let nextId = mockProducts.length + 1

// 模拟获取商品列表的API函数
export function getProducts(params: ProductQueryParams): ProductListResponse {
  let filteredProducts = [...mockProducts]

  // 根据商品名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(keyword)
    )
  }

  // 根据分类筛选
  if (params.category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === params.category
    )
  }

  // 计算总数
  const total = filteredProducts.length

  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  return {
    list: paginatedProducts,
    total,
    page,
    pageSize
  }
}

// 模拟创建商品的API函数
export async function createProduct(data: ProductCreateRequest): Promise<Product> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const category = categories.find(c => c.id === data.category)
  const newProduct: Product = {
    id: nextId++,
    ...data,
    categoryName: category?.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockProducts.unshift(newProduct)
  return newProduct
}

// 模拟更新商品的API函数
export async function updateProduct(data: ProductUpdateRequest): Promise<Product> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockProducts.findIndex(p => p.id === data.id)
  if (index === -1) {
    throw new Error('商品不存在')
  }
  
  const category = categories.find(c => c.id === data.category)
  const updatedProduct: Product = {
    ...mockProducts[index]!,
    ...data,
    categoryName: category?.name,
    createdAt: mockProducts[index]!.createdAt, // 保留原创建时间
    updatedAt: new Date().toISOString()
  }
  
  mockProducts[index] = updatedProduct
  return updatedProduct
}

// 模拟删除商品的API函数
export async function deleteProduct(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockProducts.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('商品不存在')
  }
  
  mockProducts.splice(index, 1)
  return true
}

// 模拟图片上传的API函数
export async function uploadImage(_file: File): Promise<string> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 生成随机图片ID
  const imageId = Math.floor(Math.random() * 1000) + 1
  // 返回模拟的图片URL
  return `https://picsum.photos/id/${imageId}/400/300`
}

// 生成随机订单数据
function generateMockOrders(count: number): Order[] {
  const orders: Order[] = []
  const userNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const paymentMethods = ['支付宝', '微信支付', '银行卡支付', '货到付款']
  const statuses: OrderStatus[] = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED
  ]

  for (let i = 1; i <= count; i++) {
    // 随机生成订单项数量
    const itemCount = Math.floor(Math.random() * 5) + 1
    const orderItems: OrderItem[] = []
    let totalAmount = 0

    for (let j = 0; j < itemCount; j++) {
      // 随机选择一个商品
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]!
      const quantity = Math.floor(Math.random() * 5) + 1
      const itemTotal = product.price * quantity
      
      orderItems.push({
        id: i * 10 + j,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        image: product.images[0] || ''
      })
      
      totalAmount += itemTotal
    }

    // 生成订单号
    const orderNo = `ORD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    orders.push({
      id: i.toString(),
      orderNo,
      userId: i,
      userName: userNames[Math.floor(Math.random() * userNames.length)]!,
      totalAmount,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]!,
      shippingAddress: `地址${i}，街道${Math.floor(Math.random() * 100) + 1}号`,
      contactPhone: `13${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      orderItems,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }

  return orders
}

// 模拟订单数据
let mockOrders = generateMockOrders(50)

// 模拟获取订单列表的API函数
export function getOrders(params: OrderQueryParams): OrderListResponse {
  let filteredOrders = [...mockOrders]

  // 根据订单号筛选
  if (params.orderNo) {
    filteredOrders = filteredOrders.filter(order => 
      order.orderNo.toLowerCase().includes(params.orderNo!.toLowerCase())
    )
  }

  // 根据用户名称筛选
  if (params.userName) {
    filteredOrders = filteredOrders.filter(order => 
      order.userName.toLowerCase().includes(params.userName!.toLowerCase())
    )
  }

  // 根据订单状态筛选
  if (params.status) {
    filteredOrders = filteredOrders.filter(order => order.status === params.status)
  }

  // 根据时间范围筛选
  if (params.startTime && params.endTime) {
    const startDate = new Date(params.startTime)
    const endDate = new Date(params.endTime)
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  // 计算总数
  const total = filteredOrders.length

  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  return {
    list: paginatedOrders,
    total,
    page,
    pageSize
  }
}

// 模拟更新订单状态的API函数
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId)
  if (orderIndex === -1) {
    throw new Error('订单不存在')
  }
  
  const updatedOrder: Order = {
    ...mockOrders[orderIndex]!,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockOrders[orderIndex] = updatedOrder
  return updatedOrder
}

// 生成近30天销售趋势数据
function generateMockSalesTrendData(): SalesTrendData[] {
  const trendData: SalesTrendData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    
    // 生成随机销售金额，范围在5000-20000之间
    const amount = Math.floor(Math.random() * 15000) + 5000
    
    trendData.push({
      date: date.toISOString().split('T')[0] || '', // 格式：YYYY-MM-DD
      amount
    })
  }
  
  return trendData
}

// 生成商品分类销售数据
function generateMockCategorySalesData(): CategorySalesData[] {
  const categorySales: Record<string, number> = {
    '电子产品': 0,
    '家居用品': 0,
    '服装鞋帽': 0,
    '食品饮料': 0,
    '图书文具': 0
  }
  
  // 计算总销售额
  const totalSales = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  
  // 按分类统计销售额
  mockOrders.forEach(order => {
    order.orderItems.forEach(item => {
      // 查找商品分类
      const product = mockProducts.find(p => p.id === item.productId)
      if (product?.categoryName && categorySales[product.categoryName] !== undefined) {
        categorySales[product.categoryName] = (categorySales[product.categoryName] || 0) + (item.price * item.quantity)
      }
    })
  })
  
  // 转换为CategorySalesData格式
  return Object.entries(categorySales).map(([category, amount]) => ({
    category,
    amount,
    percentage: parseFloat(((amount / totalSales) * 100).toFixed(2))
  }))
}

// 生成销售统计数据
function generateMockSalesStatsData(): SalesStatsData {
  const trendData = generateMockSalesTrendData()
  const categoryData = generateMockCategorySalesData()
  
  const totalSales = trendData.reduce((sum, item) => sum + item.amount, 0)
  const averageSales = parseFloat((totalSales / trendData.length).toFixed(2))
  const totalOrders = mockOrders.length
  
  // 找出销售最好的分类
  const topCategory = categoryData.reduce((top, current) => 
    current.amount > top.amount ? current : top
  ).category
  
  return {
    totalSales,
    averageSales,
    totalOrders,
    topCategory
  }
}

// 模拟销售数据
let mockSalesTrendData = generateMockSalesTrendData()
let mockCategorySalesData = generateMockCategorySalesData()
let mockSalesStatsData = generateMockSalesStatsData()

// 模拟获取销售数据的API函数
export async function getSalesData(): Promise<SalesDataResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    trendData: mockSalesTrendData,
    categoryData: mockCategorySalesData,
    statsData: mockSalesStatsData
  }
}








// ==========================================
// 权限管理模块
// ==========================================

// 生成随机权限数据
function generateMockPermissions(count: number): Permission[] {
  const permissions: Permission[] = []
  const modules = ['系统管理', '用户管理', '商品管理', '订单管理', '促销管理', '内容管理']
  const types: ('menu' | 'button' | 'api')[] = ['menu', 'button', 'api']
  const names = ['查看', '添加', '编辑', '删除', '禁用', '启用', '导出', '导入']
  
  for (let i = 1; i <= count; i++) {
    const module = modules[Math.floor(Math.random() * modules.length)]!
    const type = types[Math.floor(Math.random() * types.length)]!
    const name = `${module}${names[Math.floor(Math.random() * names.length)]}`
    const code = `${module.toLowerCase().replace(/[\s]/g, '')}_${name.toLowerCase().replace(/[\s]/g, '')}`
    
    permissions.push({
      id: `permission_${i}`,
      name,
      code,
      description: `${name}权限描述`,
      module,
      type,
      path: type === 'menu' ? `/${module.toLowerCase().replace(/[\s]/g, '')}` : undefined,
      parentId: Math.random() > 0.5 ? `permission_${Math.floor(Math.random() * i)}` : undefined,
      sort: Math.floor(Math.random() * 100) + 1,
      status: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return permissions
}

// 模拟权限数据
let mockPermissions = generateMockPermissions(20)
let nextPermissionId = mockPermissions.length + 1

// 模拟获取权限列表的API函数
export function getPermissions(params: PermissionQueryParams): PermissionListResponse {
  let filteredPermissions = [...mockPermissions]
  
  // 根据权限名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.name.toLowerCase().includes(keyword)
    )
  }
  
  // 根据权限编码筛选
  if (params.code) {
    const keyword = params.code.toLowerCase()
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.code.toLowerCase().includes(keyword)
    )
  }
  
  // 根据模块筛选
  if (params.module) {
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.module === params.module
    )
  }
  
  // 根据类型筛选
  if (params.type) {
    filteredPermissions = filteredPermissions.filter(permission => 
      permission.type === params.type
    )
  }
  
  // 计算总数
  const total = filteredPermissions.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex)
  
  return {
    list: paginatedPermissions,
    total,
    page,
    pageSize
  }
}

// 模拟创建权限的API函数
export async function createPermission(data: PermissionCreateRequest): Promise<Permission> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newPermission: Permission = {
    id: `permission_${nextPermissionId++}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockPermissions.unshift(newPermission)
  return newPermission
}

// 模拟更新权限的API函数
export async function updatePermission(id: string, data: PermissionUpdateRequest): Promise<Permission> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockPermissions.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('权限不存在')
  }
  
  const updatedPermission: Permission = {
    ...mockPermissions[index]!,
    ...data,
    createdAt: mockPermissions[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockPermissions[index] = updatedPermission
  return updatedPermission
}

// 模拟删除权限的API函数
export async function deletePermission(id: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockPermissions.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('权限不存在')
  }
  
  mockPermissions.splice(index, 1)
  return true
}

// 模拟更新权限状态的API函数
export async function updatePermissionStatus(id: string, status: boolean): Promise<Permission> {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockPermissions.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('权限不存在')
  }
  
  const updatedPermission: Permission = {
    ...mockPermissions[index]!,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockPermissions[index] = updatedPermission
  return updatedPermission
}



// ==========================================
// 用户中心模块
// ==========================================

// 生成随机用户数据
function generateMockUsers(count: number): User[] {
  const users: User[] = []
  const roles: ('admin' | 'user')[] = ['admin', 'user']
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive']
  
  for (let i = 1; i <= count; i++) {
    const userRole = roles[Math.floor(Math.random() * roles.length)]!
    const roleId = `role_${Math.floor(Math.random() * 8) + 1}`
    
    users.push({
      id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      phone: `13${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      role: userRole,
      roleId: roleId,
      permissions: userRole === 'admin' 
        ? mockPermissions.map(_ => _.id) // 管理员拥有所有权限
        : mockPermissions
            .filter(_ => Math.random() > 0.5) // 随机分配50%的权限
            .map(_ => _.id),
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return users
}

// 模拟用户数据
let mockUsers = generateMockUsers(20)
let nextUserId = mockUsers.length + 1

// 模拟获取用户列表的API函数
export function getUsers(params: UserQueryParams): UserListResponse {
  let filteredUsers = [...mockUsers]
  
  // 根据用户名筛选
  if (params.username) {
    const keyword = params.username.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(keyword)
    )
  }
  
  // 根据电话筛选
  if (params.phone) {
    const keyword = params.phone.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.phone.toLowerCase().includes(keyword)
    )
  }
  
  // 根据邮箱筛选
  if (params.email) {
    const keyword = params.email.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(keyword)
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredUsers = filteredUsers.filter(user => 
      user.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredUsers.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
  
  return {
    list: paginatedUsers,
    total,
    page,
    pageSize
  }
}

// 模拟创建用户的API函数
export async function createUser(data: UserCreateRequest): Promise<User> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newUser: User = {
    id: nextUserId++,
    ...data,
    permissions: data.permissions || (data.role === 'admin' 
      ? mockPermissions.map(_ => _.id) 
      : mockPermissions.filter(_ => Math.random() > 0.5).map(_ => _.id)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockUsers.unshift(newUser)
  return newUser
}

// 模拟更新用户的API函数
export async function updateUser(data: UserUpdateRequest): Promise<User> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockUsers.findIndex(u => u.id === data.id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  
  const updatedUser: User = {
    ...mockUsers[index]!,
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  mockUsers[index] = updatedUser
  return updatedUser
}

// 模拟删除用户的API函数
export async function deleteUser(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockUsers.findIndex(u => u.id === id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  
  mockUsers.splice(index, 1)
  return true
}

// ==========================================
// 促销中心模块
// ==========================================

// 生成随机促销活动数据
function generateMockPromotions(count: number): Promotion[] {
  const promotions: Promotion[] = []
  const types: ('discount' | 'coupon' | 'rebate')[] = ['discount', 'coupon', 'rebate']
  const statuses: ('active' | 'inactive' | 'expired')[] = ['active', 'inactive', 'expired']
  const names = ['限时折扣', '满减优惠券', '积分返利', '新用户专享', '节日促销', '清仓大甩卖', '会员专享', '买一送一']
  
  for (let i = 1; i <= count; i++) {
    promotions.push({
      id: i,
      name: `${names[Math.floor(Math.random() * names.length)]} ${i}`,
      type: types[Math.floor(Math.random() * types.length)]!,
      description: `这是一个${names[Math.floor(Math.random() * names.length)]}活动`,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      startTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      endTime: new Date(Date.now() + Math.random() * 31536000000).toISOString(),
      discountValue: Math.floor(Math.random() * 50) + 10,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return promotions
}

// 模拟促销活动数据
let mockPromotions = generateMockPromotions(15)
let nextPromotionId = mockPromotions.length + 1

// 模拟获取促销活动列表的API函数
export function getPromotions(params: PromotionQueryParams): PromotionListResponse {
  let filteredPromotions = [...mockPromotions]
  
  // 根据名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredPromotions = filteredPromotions.filter(promotion => 
      promotion.name.toLowerCase().includes(keyword)
    )
  }
  
  // 根据类型筛选
  if (params.type) {
    filteredPromotions = filteredPromotions.filter(promotion => 
      promotion.type === params.type
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredPromotions = filteredPromotions.filter(promotion => 
      promotion.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredPromotions.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex)
  
  return {
    list: paginatedPromotions,
    total,
    page,
    pageSize
  }
}

// 模拟创建促销活动的API函数
export async function createPromotion(data: PromotionCreateRequest): Promise<Promotion> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newPromotion: Promotion = {
    id: nextPromotionId++,
    ...data,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockPromotions.unshift(newPromotion)
  return newPromotion
}

// 模拟更新促销活动的API函数
export async function updatePromotion(data: PromotionUpdateRequest): Promise<Promotion> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockPromotions.findIndex(p => p.id === data.id)
  if (index === -1) {
    throw new Error('促销活动不存在')
  }
  
  const updatedPromotion: Promotion = {
    ...mockPromotions[index]!,
    ...data,
    createdAt: mockPromotions[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockPromotions[index] = updatedPromotion
  return updatedPromotion
}

// 模拟删除促销活动的API函数
export async function deletePromotion(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockPromotions.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('促销活动不存在')
  }
  
  mockPromotions.splice(index, 1)
  return true
}

// ==========================================
// 内容管理模块
// ==========================================

// 生成随机内容数据
function generateMockContents(count: number): Content[] {
  const contents: Content[] = []
  const types: ('article' | 'banner' | 'notice')[] = ['article', 'banner', 'notice']
  const statuses: ('published' | 'draft')[] = ['published', 'draft']
  const titles = ['最新活动公告', '产品介绍', '使用教程', '公司新闻', '系统更新通知', '常见问题解答', '联系我们', '关于我们']
  
  for (let i = 1; i <= count; i++) {
    contents.push({
      id: i,
      title: `${titles[Math.floor(Math.random() * titles.length)]} ${i}`,
      type: types[Math.floor(Math.random() * types.length)]!,
      content: `这是${titles[Math.floor(Math.random() * titles.length)]}的内容...`,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      sort: i,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return contents
}

// 模拟内容数据
let mockContents = generateMockContents(25)
let nextContentId = mockContents.length + 1

// 模拟获取内容列表的API函数
export function getContents(params: ContentQueryParams): ContentListResponse {
  let filteredContents = [...mockContents]
  
  // 根据标题筛选
  if (params.title) {
    const keyword = params.title.toLowerCase()
    filteredContents = filteredContents.filter(content => 
      content.title.toLowerCase().includes(keyword)
    )
  }
  
  // 根据类型筛选
  if (params.type) {
    filteredContents = filteredContents.filter(content => 
      content.type === params.type
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredContents = filteredContents.filter(content => 
      content.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredContents.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedContents = filteredContents.slice(startIndex, endIndex)
  
  return {
    list: paginatedContents,
    total,
    page,
    pageSize
  }
}

// 模拟创建内容的API函数
export async function createContent(data: ContentCreateRequest): Promise<Content> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newContent: Content = {
    id: nextContentId++,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockContents.unshift(newContent)
  return newContent
}

// 模拟更新内容的API函数
export async function updateContent(data: ContentUpdateRequest): Promise<Content> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockContents.findIndex(c => c.id === data.id)
  if (index === -1) {
    throw new Error('内容不存在')
  }
  
  const updatedContent: Content = {
    ...mockContents[index]!,
    ...data,
    createdAt: mockContents[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockContents[index] = updatedContent
  return updatedContent
}

// 模拟删除内容的API函数
export async function deleteContent(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockContents.findIndex(c => c.id === id)
  if (index === -1) {
    throw new Error('内容不存在')
  }
  
  mockContents.splice(index, 1)
  return true
}

// ==========================================
// 采购中心模块
// ==========================================

// 生成随机采购订单数据
function generateMockProcurementOrders(count: number): ProcurementOrder[] {
  const orders: ProcurementOrder[] = []
  const suppliers = ['供应商A', '供应商B', '供应商C', '供应商D', '供应商E']
  const statuses: ('pending' | 'approved' | 'purchased' | 'completed' | 'cancelled')[] = ['pending', 'approved', 'purchased', 'completed', 'cancelled']
  
  for (let i = 1; i <= count; i++) {
    orders.push({
      id: i,
      orderNo: `PO${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)]!,
      totalAmount: Math.floor(Math.random() * 100000) + 10000,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      orderDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      expectedDeliveryDate: new Date(Date.now() + Math.random() * 31536000000).toISOString(),
      actualDeliveryDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 31536000000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return orders
}

// 模拟采购订单数据
let mockProcurementOrders = generateMockProcurementOrders(30)
let nextProcurementId = mockProcurementOrders.length + 1

// 模拟获取采购订单列表的API函数
export function getProcurementOrders(params: ProcurementQueryParams): ProcurementListResponse {
  let filteredOrders = [...mockProcurementOrders]
  
  // 根据订单号筛选
  if (params.orderNo) {
    filteredOrders = filteredOrders.filter(order => 
      order.orderNo.includes(params.orderNo || '')
    )
  }
  
  // 根据供应商名称筛选
  if (params.supplierName) {
    const keyword = params.supplierName.toLowerCase()
    filteredOrders = filteredOrders.filter(order => 
      order.supplierName.toLowerCase().includes(keyword)
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredOrders = filteredOrders.filter(order => 
      order.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredOrders.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
  
  return {
    list: paginatedOrders,
    total,
    page,
    pageSize
  }
}

// 模拟创建采购订单的API函数
export async function createProcurementOrder(data: ProcurementCreateRequest): Promise<ProcurementOrder> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newOrder: ProcurementOrder = {
    id: nextProcurementId++,
    orderNo: `PO${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    supplierName: data.supplierName,
    totalAmount: data.totalAmount,
    status: 'pending',
    orderDate: data.orderDate,
    expectedDeliveryDate: data.expectedDeliveryDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockProcurementOrders.unshift(newOrder)
  return newOrder
}

// 模拟更新采购订单的API函数
export async function updateProcurementOrder(data: ProcurementUpdateRequest): Promise<ProcurementOrder> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockProcurementOrders.findIndex(p => p.id === data.id)
  if (index === -1) {
    throw new Error('采购订单不存在')
  }
  
  const updatedOrder: ProcurementOrder = {
    ...mockProcurementOrders[index]!,
    ...data,
    createdAt: mockProcurementOrders[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockProcurementOrders[index] = updatedOrder
  return updatedOrder
}

// 模拟删除采购订单的API函数
export async function deleteProcurementOrder(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockProcurementOrders.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('采购订单不存在')
  }
  
  mockProcurementOrders.splice(index, 1)
  return true
}

// ==========================================
// WMS仓库管理模块
// ==========================================

// 生成随机仓库数据
function generateMockWarehouses(count: number): Warehouse[] {
  const warehouses: Warehouse[] = []
  const names = ['北京仓库', '上海仓库', '广州仓库', '深圳仓库', '杭州仓库', '成都仓库', '武汉仓库']
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive']
  
  for (let i = 1; i <= count; i++) {
    warehouses.push({
      id: i,
      name: names[Math.floor(Math.random() * names.length)]!,
      address: `${names[Math.floor(Math.random() * names.length)]}附近街道${Math.floor(Math.random() * 100) + 1}号`,
      manager: `仓库管理员${i}`,
      phone: `13${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return warehouses
}

// 生成随机库存数据
function generateMockInventory(count: number, warehouses: Warehouse[]): Inventory[] {
  const inventory: Inventory[] = []
  const productNames = ['智能手机', '平板电脑', '笔记本电脑', '智能手表', '无线耳机', '电视', '冰箱', '洗衣机', '空调', '微波炉']
  
  for (let i = 1; i <= count; i++) {
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)]!
    const quantity = Math.floor(Math.random() * 1000)
    const minStock = 50
    const maxStock = 500
    let status: 'normal' | 'low' | 'high' = 'normal'
    
    if (quantity < minStock) status = 'low'
    if (quantity > maxStock) status = 'high'
    
    inventory.push({
      id: i,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      productName: productNames[Math.floor(Math.random() * productNames.length)]!,
      sku: `SKU${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      quantity,
      minStock,
      maxStock,
      status: status!,
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return inventory
}

// 模拟仓库数据
let mockWarehouses = generateMockWarehouses(7)
let mockInventory = generateMockInventory(50, mockWarehouses)
let nextWarehouseId = mockWarehouses.length + 1
let nextInventoryId = mockInventory.length + 1

// 模拟获取仓库列表的API函数
export function getWarehouses(params: WarehouseQueryParams): WarehouseListResponse {
  let filteredWarehouses = [...mockWarehouses]
  
  // 根据名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredWarehouses = filteredWarehouses.filter(warehouse => 
      warehouse.name.toLowerCase().includes(keyword)
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredWarehouses = filteredWarehouses.filter(warehouse => 
      warehouse.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredWarehouses.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedWarehouses = filteredWarehouses.slice(startIndex, endIndex)
  
  return {
    list: paginatedWarehouses,
    total,
    page,
    pageSize
  }
}

// 模拟获取库存列表的API函数
export function getInventory(params: InventoryQueryParams): InventoryListResponse {
  let filteredInventory = [...mockInventory]
  
  // 根据商品名称筛选
  if (params.productName) {
    const keyword = params.productName.toLowerCase()
    filteredInventory = filteredInventory.filter(item => 
      item.productName.toLowerCase().includes(keyword)
    )
  }
  
  // 根据SKU筛选
  if (params.sku) {
    filteredInventory = filteredInventory.filter(item => 
      item.sku.includes(params.sku || '')
    )
  }
  
  // 根据仓库ID筛选
  if (params.warehouseId) {
    filteredInventory = filteredInventory.filter(item => 
      item.warehouseId === params.warehouseId
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredInventory = filteredInventory.filter(item => 
      item.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredInventory.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex)
  
  return {
    list: paginatedInventory,
    total,
    page,
    pageSize
  }
}

// 模拟创建仓库的API函数
export async function createWarehouse(data: WarehouseCreateRequest): Promise<Warehouse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newWarehouse: Warehouse = {
    id: nextWarehouseId++,
    ...data,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockWarehouses.unshift(newWarehouse)
  return newWarehouse
}

// 模拟更新仓库的API函数
export async function updateWarehouse(data: WarehouseUpdateRequest): Promise<Warehouse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockWarehouses.findIndex(w => w.id === data.id)
  if (index === -1) {
    throw new Error('仓库不存在')
  }
  
  const updatedWarehouse: Warehouse = {
    ...mockWarehouses[index]!,
    ...data,
    createdAt: mockWarehouses[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockWarehouses[index] = updatedWarehouse
  return updatedWarehouse
}

// 模拟删除仓库的API函数
export async function deleteWarehouse(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockWarehouses.findIndex(w => w.id === id)
  if (index === -1) {
    throw new Error('仓库不存在')
  }
  
  mockWarehouses.splice(index, 1)
  return true
}

// 模拟创建库存的API函数
export async function createInventory(data: InventoryCreateRequest): Promise<Inventory> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const warehouse = mockWarehouses.find(w => w.id === data.warehouseId)
  if (!warehouse) {
    throw new Error('仓库不存在')
  }
  
  let status: 'normal' | 'low' | 'high' = 'normal'
  if (data.quantity < data.minStock) status = 'low'
  if (data.quantity > data.maxStock) status = 'high'
  
  const newInventory: Inventory = {
    id: nextInventoryId++,
    ...data,
    warehouseName: warehouse.name,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockInventory.unshift(newInventory)
  return newInventory
}

// 模拟更新库存的API函数
export async function updateInventory(data: InventoryUpdateRequest): Promise<Inventory> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockInventory.findIndex(i => i.id === data.id)
  if (index === -1) {
    throw new Error('库存不存在')
  }
  
  const warehouse = mockWarehouses.find(w => w.id === data.warehouseId)
  if (!warehouse) {
    throw new Error('仓库不存在')
  }
  
  let status: 'normal' | 'low' | 'high' = 'normal'
  if (data.quantity < data.minStock) status = 'low'
  if (data.quantity > data.maxStock) status = 'high'
  
  const updatedInventory: Inventory = {
    ...mockInventory[index]!,
    ...data,
    warehouseName: warehouse.name,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockInventory[index] = updatedInventory
  return updatedInventory
}

// 模拟删除库存的API函数
export async function deleteInventory(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockInventory.findIndex(i => i.id === id)
  if (index === -1) {
    throw new Error('库存不存在')
  }
  
  mockInventory.splice(index, 1)
  return true
}

// ==========================================
// 调度中心模块
// ==========================================

// 生成随机调度任务数据
function generateMockDispatchTasks(count: number): DispatchTask[] {
  const tasks: DispatchTask[] = []
  const statuses: ('pending' | 'processing' | 'completed' | 'failed')[] = ['pending', 'processing', 'completed', 'failed']
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    const requiredQuantity = Math.floor(Math.random() * 100)
    const dispatchedQuantity = status === 'completed' ? requiredQuantity : Math.floor(Math.random() * requiredQuantity)
    
    tasks.push({
      id: i,
      taskNo: `TASK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      orderId: Math.floor(Math.random() * 1000),
      warehouseId: Math.floor(Math.random() * 10) + 1,
      warehouseName: `仓库${Math.floor(Math.random() * 10) + 1}`,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)]!,
      requiredQuantity,
      dispatchedQuantity,
      operator: status !== 'pending' ? `操作员${Math.floor(Math.random() * 100) + 1}` : undefined,
      startTime: status !== 'pending' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : undefined,
      endTime: status === 'completed' || status === 'failed' ? new Date(Date.now() - Math.random() * 43200000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return tasks
}

// 模拟调度任务数据
let mockDispatchTasks = generateMockDispatchTasks(40)
let nextDispatchId = mockDispatchTasks.length + 1

// 模拟获取调度任务列表的API函数
export function getDispatchTasks(params: DispatchQueryParams): DispatchListResponse {
  let filteredTasks = [...mockDispatchTasks]
  
  // 根据任务号筛选
  if (params.taskNo) {
    filteredTasks = filteredTasks.filter(task => 
      task.taskNo.includes(params.taskNo || '')
    )
  }
  
  // 根据订单ID筛选
  if (params.orderId) {
    filteredTasks = filteredTasks.filter(task => 
      task.orderId === params.orderId
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredTasks = filteredTasks.filter(task => 
      task.status === params.status
    )
  }
  
  // 根据优先级筛选
  if (params.priority) {
    filteredTasks = filteredTasks.filter(task => 
      task.priority === params.priority
    )
  }
  
  // 计算总数
  const total = filteredTasks.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
  
  return {
    list: paginatedTasks,
    total,
    page,
    pageSize
  }
}

// 模拟创建调度任务的API函数
export async function createDispatchTask(data: DispatchCreateRequest): Promise<DispatchTask> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const warehouse = mockWarehouses.find(w => w.id === data.warehouseId)
  
  const newTask: DispatchTask = {
    id: nextDispatchId++,
    taskNo: `TASK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    orderId: data.orderId,
    warehouseId: data.warehouseId,
    warehouseName: warehouse?.name || `仓库${data.warehouseId}`,
    status: 'pending',
    priority: data.priority,
    requiredQuantity: data.requiredQuantity,
    dispatchedQuantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockDispatchTasks.unshift(newTask)
  return newTask
}

// 模拟更新调度任务的API函数
export async function updateDispatchTask(data: DispatchUpdateRequest): Promise<DispatchTask> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockDispatchTasks.findIndex(t => t.id === data.id)
  if (index === -1) {
    throw new Error('调度任务不存在')
  }
  
  const updatedTask: DispatchTask = {
    ...mockDispatchTasks[index]!,
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  mockDispatchTasks[index] = updatedTask
  return updatedTask
}

// 模拟删除调度任务的API函数
export async function deleteDispatchTask(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockDispatchTasks.findIndex(t => t.id === id)
  if (index === -1) {
    throw new Error('调度任务不存在')
  }
  
  mockDispatchTasks.splice(index, 1)
  return true
}

// ==========================================
// 物流中心模块
// ==========================================

// 生成随机物流信息数据
function generateMockLogisticsInfo(count: number): LogisticsInfo[] {
  const logistics: LogisticsInfo[] = []
  const carriers = ['顺丰速运', '中通快递', '圆通快递', '申通快递', '韵达快递', 'EMS']
  const statuses: ('pending' | 'shipped' | 'in_transit' | 'delivered' | 'returned')[] = ['pending', 'shipped', 'in_transit', 'delivered', 'returned']
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    
    logistics.push({
      id: i,
      orderId: Math.floor(Math.random() * 1000),
      logisticsNo: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
      carrierName: carriers[Math.floor(Math.random() * carriers.length)]!,
      status,
      trackingUrl: `https://tracking.example.com/${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
      estimatedDeliveryDate: new Date(Date.now() + Math.random() * 604800000).toISOString(),
      actualDeliveryDate: status === 'delivered' ? new Date(Date.now() - Math.random() * 31536000000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return logistics
}

// 模拟物流信息数据
let mockLogisticsInfo = generateMockLogisticsInfo(60)
let nextLogisticsId = mockLogisticsInfo.length + 1

// 模拟获取物流信息列表的API函数
export function getLogisticsInfo(params: LogisticsQueryParams): LogisticsListResponse {
  let filteredLogistics = [...mockLogisticsInfo]
  
  // 根据物流单号筛选
  if (params.logisticsNo) {
    filteredLogistics = filteredLogistics.filter(logistic => 
      logistic.logisticsNo.includes(params.logisticsNo || '')
    )
  }
  
  // 根据订单ID筛选
  if (params.orderId) {
    filteredLogistics = filteredLogistics.filter(logistic => 
      logistic.orderId === params.orderId
    )
  }
  
  // 根据快递公司筛选
  if (params.carrierName) {
    const keyword = params.carrierName.toLowerCase()
    filteredLogistics = filteredLogistics.filter(logistic => 
      logistic.carrierName.toLowerCase().includes(keyword)
    )
  }
  
  // 根据状态筛选
  if (params.status) {
    filteredLogistics = filteredLogistics.filter(logistic => 
      logistic.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredLogistics.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedLogistics = filteredLogistics.slice(startIndex, endIndex)
  
  return {
    list: paginatedLogistics,
    total,
    page,
    pageSize
  }
}

// 模拟创建物流信息的API函数
export async function createLogisticsInfo(data: LogisticsCreateRequest): Promise<LogisticsInfo> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newLogistics: LogisticsInfo = {
    id: nextLogisticsId++,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockLogisticsInfo.unshift(newLogistics)
  return newLogistics
}

// 模拟更新物流信息的API函数
export async function updateLogisticsInfo(data: LogisticsUpdateRequest): Promise<LogisticsInfo> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockLogisticsInfo.findIndex(l => l.id === data.id)
  if (index === -1) {
    throw new Error('物流信息不存在')
  }
  
  const updatedLogistics: LogisticsInfo = {
    ...mockLogisticsInfo[index]!,
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  mockLogisticsInfo[index] = updatedLogistics
  return updatedLogistics
}

// 模拟删除物流信息的API函数
export async function deleteLogisticsInfo(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockLogisticsInfo.findIndex(l => l.id === id)
  if (index === -1) {
    throw new Error('物流信息不存在')
  }
  
  mockLogisticsInfo.splice(index, 1)
  return true
}

// ==========================================
// 角色管理模块
// ==========================================

// 生成随机角色数据
function generateMockRoles(count: number): Role[] {
  const roles: Role[] = []
  const roleNames = [
    '超级管理员', '商品管理员', '订单管理员', '促销管理员', '内容管理员',
    '仓库管理员', '物流管理员', '普通用户'
  ]
  
  for (let i = 1; i <= count; i++) {
    // 随机选择1-5个权限
    const permissionCount = Math.floor(Math.random() * 5) + 1
    const permissions = mockPermissions
      .sort(() => 0.5 - Math.random())
      .slice(0, permissionCount)
      .map(p => p.id)
    
    roles.push({
      id: `role_${i}`,
      name: roleNames[Math.floor(Math.random() * roleNames.length)]!,
      code: `role_${roleNames[Math.floor(Math.random() * roleNames.length)]!.toLowerCase().replace(/[\s]/g, '')}_${i}`,
      description: `这是一个${roleNames[Math.floor(Math.random() * roleNames.length)]!}角色`,
      status: Math.random() > 0.3,
      permissions,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    })
  }
  
  return roles
}

// 模拟角色数据
let mockRoles = generateMockRoles(10)
let nextRoleId = mockRoles.length + 1

// 模拟用户权限数据
let mockUserPermissions: UserPermission[] = mockUsers.map(user => ({
  userId: user.id,
  permissions: user.role === 'admin' 
    ? mockPermissions.map(_ => _.id) // 管理员拥有所有权限
    : mockPermissions
        .filter(_ => Math.random() > 0.5) // 随机分配50%的权限
        .map(_ => _.id)
}))

// 模拟获取角色列表的API函数
export function getRoles(params: RoleQueryParams): RoleListResponse {
  let filteredRoles = [...mockRoles]
  
  // 根据角色名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredRoles = filteredRoles.filter(role => 
      role.name.toLowerCase().includes(keyword)
    )
  }
  
  // 根据角色编码筛选
  if (params.code) {
    const keyword = params.code.toLowerCase()
    filteredRoles = filteredRoles.filter(role => 
      role.code.toLowerCase().includes(keyword)
    )
  }
  
  // 根据状态筛选
  if (params.status !== undefined) {
    filteredRoles = filteredRoles.filter(role => 
      role.status === params.status
    )
  }
  
  // 计算总数
  const total = filteredRoles.length
  
  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex)
  
  return {
    list: paginatedRoles,
    total,
    page,
    pageSize
  }
}

// 模拟创建角色的API函数
export async function createRole(data: RoleCreateRequest): Promise<Role> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newRole: Role = {
    id: `role_${nextRoleId++}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockRoles.unshift(newRole)
  return newRole
}

// 模拟更新角色的API函数
export async function updateRole(id: string, data: RoleUpdateRequest): Promise<Role> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockRoles.findIndex(r => r.id === id)
  if (index === -1) {
    throw new Error('角色不存在')
  }
  
  const updatedRole: Role = {
    ...mockRoles[index]!,
    ...data,
    createdAt: mockRoles[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockRoles[index] = updatedRole
  return updatedRole
}

// 模拟删除角色的API函数
export async function deleteRole(id: string): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockRoles.findIndex(r => r.id === id)
  if (index === -1) {
    throw new Error('角色不存在')
  }
  
  mockRoles.splice(index, 1)
  return true
}

// 模拟更新角色状态的API函数
export async function updateRoleStatus(id: string, status: boolean): Promise<Role> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockRoles.findIndex(r => r.id === id)
  if (index === -1) {
    throw new Error('角色不存在')
  }
  
  const updatedRole: Role = {
    ...mockRoles[index]!,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockRoles[index] = updatedRole
  return updatedRole
}

// ==========================================
// 客户管理模块
// ==========================================

// 客户等级
const customerLevels = ['regular', 'silver', 'gold', 'platinum'] as const
const customerStatuses = ['active', 'inactive', 'blocked'] as const

// 客户标签
const customerTags = ['VIP', '老客户', '新客户', '高价值', '潜力客户', '投诉过的', '企业客户', '个人客户']

// 生成随机客户数据
function generateMockCustomers(count: number): Customer[] {
  const customers: Customer[] = []
  const firstNames = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡']
  const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明']
  const companies = ['科技有限公司', '贸易有限公司', '实业集团', '信息咨询公司', '服务中心', '商贸中心']
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆']

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!
    const city = cities[Math.floor(Math.random() * cities.length)]!
    
    const tags: string[] = []
    const tagCount = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < tagCount; j++) {
      const tag = customerTags[Math.floor(Math.random() * customerTags.length)] || ''
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    }

    const level = customerLevels[Math.floor(Math.random() * customerLevels.length)] as CustomerLevel
    const totalOrders = Math.floor(Math.random() * 100)
    const totalSpent = Math.floor(Math.random() * 100000) + 1000
    const lastOrderDaysAgo = Math.floor(Math.random() * 365)

    const companyIndex = Math.floor(Math.random() * companies.length)
    const companySuffix = companies[companyIndex] || '有限公司'
    
    customers.push({
      id: i,
      name: `${firstName}${lastName}`,
      email: `customer${i}@example.com`,
      phone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: Math.random() > 0.5 ? `${lastName}${companySuffix}` : undefined,
      address: `${city}${['东城区', '西城区', '南城区', '北城区', '高新技术开发区'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 1000)}号`,
      level,
      status: customerStatuses[Math.floor(Math.random() * customerStatuses.length)] as CustomerStatus,
      totalOrders,
      totalSpent,
      lastOrderTime: new Date(Date.now() - lastOrderDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      tags,
      notes: Math.random() > 0.7 ? '重要客户，需重点关注' : undefined
    })
  }

  return customers
}

// 模拟客户数据
let mockCustomers = generateMockCustomers(100)
let nextCustomerId = mockCustomers.length + 1

// 模拟获取客户列表的API函数
export function getCustomers(params: CustomerQueryParams): CustomerListResponse {
  let filteredCustomers = [...mockCustomers]

  // 根据客户名称筛选
  if (params.name) {
    const keyword = params.name.toLowerCase()
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(keyword)
    )
  }

  // 根据邮箱筛选
  if (params.email) {
    const keyword = params.email.toLowerCase()
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.email.toLowerCase().includes(keyword)
    )
  }

  // 根据手机号筛选
  if (params.phone) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.phone.includes(params.phone!)
    )
  }

  // 根据等级筛选
  if (params.level) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.level === params.level
    )
  }

  // 根据状态筛选
  if (params.status) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.status === params.status
    )
  }

  // 根据标签筛选
  if (params.tags && params.tags.length > 0) {
    filteredCustomers = filteredCustomers.filter(customer => 
      params.tags!.some(tag => customer.tags.includes(tag))
    )
  }

  // 计算总数
  const total = filteredCustomers.length

  // 分页处理
  const { page, pageSize } = params
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  return {
    list: paginatedCustomers,
    total,
    page,
    pageSize
  }
}

// 模拟创建客户的API函数
export async function createCustomer(data: CustomerCreateRequest): Promise<Customer> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newCustomer: Customer = {
    id: nextCustomerId++,
    ...data,
    level: data.level || 'regular',
    status: 'active',
    totalOrders: 0,
    totalSpent: 0,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockCustomers.unshift(newCustomer)
  return newCustomer
}

// 模拟更新客户的API函数
export async function updateCustomer(data: CustomerUpdateRequest): Promise<Customer> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockCustomers.findIndex(c => c.id === data.id)
  if (index === -1) {
    throw new Error('客户不存在')
  }
  
  const updatedCustomer: Customer = {
    ...mockCustomers[index]!,
    ...data,
    createdAt: mockCustomers[index]!.createdAt,
    updatedAt: new Date().toISOString()
  }
  
  mockCustomers[index] = updatedCustomer
  return updatedCustomer
}

// 模拟删除客户的API函数
export async function deleteCustomer(id: number): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockCustomers.findIndex(c => c.id === id)
  if (index === -1) {
    throw new Error('客户不存在')
  }
  
  mockCustomers.splice(index, 1)
  return true
}

// 模拟批量删除客户的API函数
export async function deleteCustomers(ids: number[]): Promise<boolean> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  ids.forEach(id => {
    const index = mockCustomers.findIndex(c => c.id === id)
    if (index !== -1) {
      mockCustomers.splice(index, 1)
    }
  })
  
  return true
}

// 模拟切换客户状态的API函数
export async function toggleCustomerStatus(id: number, status: CustomerStatus): Promise<Customer> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockCustomers.findIndex(c => c.id === id)
  if (index === -1) {
    throw new Error('客户不存在')
  }
  
  const updatedCustomer: Customer = {
    ...mockCustomers[index]!,
    status,
    updatedAt: new Date().toISOString()
  }
  
  mockCustomers[index] = updatedCustomer
  return updatedCustomer
}

// 模拟获取用户权限的API函数
export function getUserPermissions(userId: number): UserPermission | undefined {
  return mockUserPermissions.find(up => up.userId === userId)
}

// 模拟分配用户权限的API函数
export async function assignUserPermissions(userId: number, permissionIds: string[]): Promise<UserPermission> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockUserPermissions.findIndex(up => up.userId === userId)
  
  if (index !== -1) {
    // 更新现有权限
    mockUserPermissions[index] = {
      userId,
      permissions: permissionIds
    }
    return mockUserPermissions[index]
  } else {
    // 创建新权限记录
    const newPermission = {
      userId,
      permissions: permissionIds
    }
    mockUserPermissions.push(newPermission)
    return newPermission
  }
}

// 分配用户角色
export async function assignUserRole(userId: number, roleId: string): Promise<void> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const userIndex = mockUsers.findIndex(user => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex]!.roleId = roleId
    mockUsers[userIndex]!.updatedAt = new Date().toISOString()
  }
}

