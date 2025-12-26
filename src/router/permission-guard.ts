import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import type { PermissionCode, RouteMeta } from '../types/permission-system'

/**
 * 权限检查函数
 * @param userPermissions 用户权限数组
 * @param requiredPermissions 需要的权限（单个或数组）
 * @returns 是否通过权限检查
 */
export function checkPermission(
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
 * 全局路由守卫
 * 处理认证和权限检查
 */
export function createPermissionGuard() {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    const meta = to.meta as RouteMeta

    // 设置页面标题
    if (meta.title) {
      document.title = `${meta.title} - 电商后台管理系统`
    }

    // 登录页面处理
    if (to.path === '/login') {
      if (authStore.isAuthenticated) {
        // 已登录用户访问登录页，重定向到首页
        next({ name: 'Home' })
        return
      } else {
        // 未登录用户允许访问登录页
        next()
        return
      }
    }

    // 检查是否需要认证
    if (meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        // 需要认证但未登录，重定向到登录页
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }

      // 检查用户信息是否存在
      if (!authStore.userInfo) {
        // 有token但没有用户信息，重新获取用户信息
        // 这里简单处理，直接重定向到登录页
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }

      // 管理员跳过权限检查（拥有所有权限）
      if (authStore.userInfo.role === 'admin') {
        next()
        return
      }

      // 权限检查
      const userPermissions = authStore.userInfo.permissions || []
      const requiredPermission = meta.requiredPermission

      if (!checkPermission(userPermissions, requiredPermission)) {
        // 权限不足，跳转到403页面或显示错误提示
        ElMessage.error('您没有权限访问该页面')
        next('/403') // 跳转到403页面
        return
      }
    }

    // 通过所有检查，正常导航
    next()
  }
}