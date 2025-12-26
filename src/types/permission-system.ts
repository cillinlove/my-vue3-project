// 权限系统相关类型定义

// 权限字符串常量
export const PermissionCode = {
  // 仪表盘权限
  DASHBOARD_VIEW: 'dashboard_view' as const,
  
  // 商品管理权限
  PRODUCT_VIEW: 'product_view' as const,
  PRODUCT_CREATE: 'product_create' as const,
  PRODUCT_EDIT: 'product_edit' as const,
  PRODUCT_DELETE: 'product_delete' as const,
  
  // 用户管理权限
  USER_VIEW: 'user_view' as const,
  USER_CREATE: 'user_create' as const,
  USER_EDIT: 'user_edit' as const,
  USER_DELETE: 'user_delete' as const,
  
  // 订单管理权限
  ORDER_VIEW: 'order_view' as const,
  ORDER_CREATE: 'order_create' as const,
  ORDER_EDIT: 'order_edit' as const,
  ORDER_DELETE: 'order_delete' as const,
  
  // 系统管理权限
  SYSTEM_VIEW: 'system_view' as const,
  SYSTEM_EDIT: 'system_edit' as const,
  
  // 设置权限
  SETTINGS_VIEW: 'settings_view' as const,
  SETTINGS_EDIT: 'settings_edit' as const
} as const;

export type PermissionCode = typeof PermissionCode[keyof typeof PermissionCode];

// 菜单项接口
export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  requiredPermissions: PermissionCode[];
  children?: MenuItem[];
  hidden?: boolean;
}

// 路由元信息接口（扩展Vue Router的RouteMeta）
export interface RouteMeta {
  requiresAuth?: boolean;
  requiredPermission?: PermissionCode | PermissionCode[];
  title?: string;
  icon?: string;
}

// 用户权限信息接口
export interface UserPermissions {
  permissions: string[];
  hasPermission: (permission: PermissionCode | PermissionCode[]) => boolean;
  hasAnyPermission: (permissions: PermissionCode[]) => boolean;
  hasAllPermissions: (permissions: PermissionCode[]) => boolean;
}