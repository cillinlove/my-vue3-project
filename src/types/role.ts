// 角色基本信息接口
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: boolean;
  permissions: string[]; // 权限ID数组
  createdAt: string;
  updatedAt: string;
}

// 创建角色请求接口
export interface CreateRoleRequest {
  name: string;
  code: string;
  description: string;
  status: boolean;
  permissions: string[];
}

// 更新角色请求接口
export interface UpdateRoleRequest {
  name: string;
  code: string;
  description: string;
  status: boolean;
  permissions: string[];
}

// 角色创建请求接口（别名）
export interface RoleCreateRequest extends CreateRoleRequest {}

// 角色更新请求接口（别名）
export interface RoleUpdateRequest extends UpdateRoleRequest {}

// 角色查询参数接口
export interface RoleQueryParams {
  name?: string;
  code?: string;
  status?: boolean;
  page: number;
  pageSize: number;
}

// 角色列表响应接口
export interface RoleListResponse {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户角色分配请求接口
export interface AssignRoleRequest {
  userId: number;
  roleId: string;
}

// 用户权限分配请求接口
export interface AssignPermissionRequest {
  userId: number;
  permissionIds: string[];
}

// 用户权限信息接口
export interface UserPermission {
  userId: number;
  permissions: string[];
}
