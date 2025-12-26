export interface User {
  id: number
  username: string
  email: string
  phone: string
  role: 'admin' | 'user'
  roleId?: string
  permissions: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface UserCreateRequest {
  username: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'user'
  roleId?: string
  permissions: string[]
  status: 'active' | 'inactive'
}

export interface UserUpdateRequest {
  id: number
  username: string
  email: string
  phone: string
  role: 'admin' | 'user'
  roleId?: string
  permissions: string[]
  status: 'active' | 'inactive'
}

export interface UserQueryParams {
  username?: string
  email?: string
  status?: 'active' | 'inactive'
  page: number
  pageSize: number
}

export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}