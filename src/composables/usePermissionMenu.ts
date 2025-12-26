import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { MenuItem } from '../types/permission-system'
import { PermissionCode } from '../types/permission-system'

// 全量菜单配置
const allMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    icon: 'Odometer',
    path: '/',
    requiredPermissions: [PermissionCode.DASHBOARD_VIEW]
  },
  {
    id: 'products',
    title: '商品管理',
    icon: 'Goods',
    path: '/products/manage',
    requiredPermissions: [PermissionCode.PRODUCT_VIEW]
  },
  {
    id: 'orders',
    title: '订单管理',
    icon: 'List',
    path: '/orders',
    requiredPermissions: [PermissionCode.ORDER_VIEW]
  },
  {
    id: 'users',
    title: '用户管理',
    icon: 'User',
    path: '/user-center',
    requiredPermissions: [PermissionCode.USER_VIEW]
  },
  {
    id: 'sales',
    title: '销售报表',
    icon: 'TrendCharts',
    path: '/sales',
    requiredPermissions: [PermissionCode.DASHBOARD_VIEW]
  },
  {
    id: 'promotions',
    title: '促销管理',
    icon: 'Discount',
    path: '/promotion-center',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'content',
    title: '内容管理',
    icon: 'Document',
    path: '/content-management',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'purchase',
    title: '采购中心',
    icon: 'ShoppingCart',
    path: '/purchase-center',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'warehouse',
    title: '仓库管理',
    icon: 'OfficeBuilding',
    path: '/wms-warehouse',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'dispatch',
    title: '调度中心',
    icon: 'Van',
    path: '/dispatch-center',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'logistics',
    title: '物流中心',
    icon: 'Location',
    path: '/logistics-center',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  },
  {
    id: 'system',
    title: '系统管理',
    icon: 'Setting',
    path: '/permission-management',
    requiredPermissions: [PermissionCode.SYSTEM_VIEW]
  },
  {
    id: 'settings',
    title: '个人设置',
    icon: 'UserFilled',
    path: '/settings',
    requiredPermissions: [PermissionCode.SETTINGS_VIEW]
  }
]

/**
 * 根据用户权限生成侧边栏菜单的Composable函数
 * @returns 过滤后的菜单项数组
 */
export function usePermissionMenu() {
  const authStore = useAuthStore()

  // 检查用户是否具有某个权限
  const hasPermission = (permission: PermissionCode | PermissionCode[]): boolean => {
    if (!authStore.userInfo) {
      return false
    }

    // 管理员拥有所有权限
    if (authStore.userInfo.role === 'admin') {
      return true
    }

    const userPermissions = authStore.userInfo.permissions || []

    // 单个权限检查
    if (typeof permission === 'string') {
      return userPermissions.includes(permission)
    }

    // 权限数组检查 - 需要拥有数组中的所有权限
    if (Array.isArray(permission)) {
      return permission.every(p => userPermissions.includes(p))
    }

    return false
  }

  // 过滤菜单项
  const filteredMenuItems = computed(() => {
    return allMenuItems.filter(menuItem => {
      // 检查用户是否具有该菜单项所需的所有权限
      return hasPermission(menuItem.requiredPermissions)
    })
  })

  // 获取用户可见的菜单项（扁平化结构）
  const visibleMenuItems = computed(() => {
    return filteredMenuItems.value.map(item => ({
      ...item,
      // 可以在这里添加更多的菜单处理逻辑
      isVisible: true,
      hasChildren: false
    }))
  })

  // 获取菜单统计数据
  const menuStats = computed(() => {
    return {
      totalItems: allMenuItems.length,
      visibleItems: visibleMenuItems.value.length,
      hiddenItems: allMenuItems.length - visibleMenuItems.value.length,
      adminAccess: authStore.userInfo?.role === 'admin'
    }
  })

  // 检查特定路径的菜单项是否存在且可见
  const isMenuItemVisible = (path: string): boolean => {
    const menuItem = allMenuItems.find(item => item.path === path)
    if (!menuItem) {
      return false
    }
    return hasPermission(menuItem.requiredPermissions)
  }

  // 根据权限代码获取菜单项
  const getMenuItemsByPermission = (permission: PermissionCode): MenuItem[] => {
    return visibleMenuItems.value.filter(item => 
      item.requiredPermissions.includes(permission)
    )
  }

  return {
    // 过滤后的菜单项
    menuItems: visibleMenuItems,
    // 菜单统计数据
    stats: menuStats,
    // 权限检查函数
    hasPermission,
    // 检查菜单项是否可见
    isMenuItemVisible,
    // 根据权限获取菜单项
    getMenuItemsByPermission,
    // 是否为管理员
    isAdmin: computed(() => authStore.userInfo?.role === 'admin')
  }
}