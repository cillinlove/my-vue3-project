import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { PermissionCode } from '../types/permission-system'

/**
 * 权限检查函数
 * @param userPermissions 用户权限数组
 * @param requiredPermissions 需要的权限（单个或数组）
 * @returns 是否通过权限检查
 */
function checkPermission(
  userPermissions: string[],
  requiredPermissions?: PermissionCode | PermissionCode[]
): boolean {
  // 如果没有权限要求，直接通过
  if (!requiredPermissions) {
    return true
  }

  // 如果用户权限数组为空，直接失败
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  // 单个权限检查
  if (typeof requiredPermissions === 'string') {
    return userPermissions.includes(requiredPermissions)
  }

  // 权限数组检查 - 需要用户拥有数组中的所有权限
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    )
  }

  return false
}

/**
 * v-permission自定义指令
 * 根据用户权限控制元素的显示和隐藏
 * 
 * 使用方式：
 * <button v-permission="'product_create'">创建商品</button>
 * <button v-permission="['product_view', 'product_edit']">查看编辑</button>
 */
const permissionDirective: Directive = {
  // 在绑定到元素时调用
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    updateVisibility(el, binding)
  },
  
  // 在组件更新时调用
  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateVisibility(el, binding)
  }
}

/**
 * 更新元素可见性
 * @param el DOM元素
 * @param binding 指令绑定对象
 */
function updateVisibility(el: HTMLElement, binding: DirectiveBinding) {
  const authStore = useAuthStore()
  
  // 获取用户权限
  const userPermissions = authStore.userInfo?.permissions || []
  
  // 管理员拥有所有权限
  const isAdmin = authStore.userInfo?.role === 'admin'
  
  // 获取需要检查的权限
  const requiredPermission = binding.value
  
  // 检查权限
  const hasPermission = isAdmin || checkPermission(userPermissions, requiredPermission)
  
  // 根据权限结果显示或隐藏元素
  if (hasPermission) {
    el.style.display = ''
    el.style.visibility = ''
    el.classList.remove('permission-hidden')
  } else {
    // 隐藏元素
    if (binding.modifiers.remove) {
      // 完全移除元素（从DOM中删除）
      el.remove()
    } else {
      // 仅隐藏元素
      el.style.display = 'none'
      el.style.visibility = 'hidden'
      el.classList.add('permission-hidden')
      // 设置属性，便于调试和样式控制
      el.setAttribute('data-permission-hidden', 'true')
    }
  }
}

/**
 * 注册权限指令
 * @param app Vue应用实例
 */
export function registerPermissionDirective(app: any) {
  app.directive('permission', permissionDirective)
}

/**
 * 权限检查工具函数
 * @param permission 权限代码
 * @returns 是否具有权限
 */
export function usePermission(permission?: PermissionCode | PermissionCode[]) {
  const authStore = useAuthStore()
  
  // 管理员拥有所有权限
  if (authStore.userInfo?.role === 'admin') {
    return true
  }
  
  const userPermissions = authStore.userInfo?.permissions || []
  return checkPermission(userPermissions, permission)
}

/**
 * 批量权限检查工具函数
 */
export function useBatchPermission() {
  const authStore = useAuthStore()
  
  // 管理员拥有所有权限
  const isAdmin = authStore.userInfo?.role === 'admin'
  
  return {
    // 检查单个权限
    check: (permission: PermissionCode | PermissionCode[]): boolean => {
      if (isAdmin) return true
      const userPermissions = authStore.userInfo?.permissions || []
      return checkPermission(userPermissions, permission)
    },
    
    // 检查是否具有所有权限
    hasAll: (permissions: PermissionCode[]): boolean => {
      if (isAdmin) return true
      const userPermissions = authStore.userInfo?.permissions || []
      return permissions.every(p => userPermissions.includes(p))
    },
    
    // 检查是否具有任一权限
    hasAny: (permissions: PermissionCode[]): boolean => {
      if (isAdmin) return true
      const userPermissions = authStore.userInfo?.permissions || []
      return permissions.some(p => userPermissions.includes(p))
    }
  }
}