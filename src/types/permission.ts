// 权限基本信息接口
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  type: 'menu' | 'button' | 'api';
  path?: string;
  parentId?: string;
  sort: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建权限请求接口
export interface CreatePermissionRequest {
  name: string;
  code: string;
  description: string;
  module: string;
  type: 'menu' | 'button' | 'api';
  path?: string;
  parentId?: string;
  sort: number;
  status: boolean;
}

// 更新权限请求接口
export interface UpdatePermissionRequest {
  name: string;
  code: string;
  description: string;
  module: string;
  type: 'menu' | 'button' | 'api';
  path?: string;
  parentId?: string;
  sort: number;
  status: boolean;
}

// 权限创建请求接口（别名）
export interface PermissionCreateRequest extends CreatePermissionRequest {}

// 权限更新请求接口（别名）
export interface PermissionUpdateRequest extends UpdatePermissionRequest {}

// 权限查询参数接口
export interface PermissionQueryParams {
  name?: string;
  code?: string;
  module?: string;
  type?: 'menu' | 'button' | 'api';
  status?: boolean;
  page: number;
  pageSize: number;
}

// 权限分页响应接口
export interface PermissionPageResponse {
  items: Permission[];
  total: number;
  page: number;
  size: number;
}

// 权限列表响应接口（与PermissionPageResponse结构相同，为了兼容）
export interface PermissionListResponse {
  list: Permission[];
  total: number;
  page: number;
  pageSize: number;
}
