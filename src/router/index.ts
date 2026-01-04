import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPermissionGuard } from './permission-guard'
import type { PermissionCode } from '../types/permission-system'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: {
      requiresAuth: false,
      title: '访问被拒绝'
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/SalesDashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: '销售仪表盘'
    }
  },
  {
    path: '/products/manage',
    name: 'ProductManage',
    component: () => import('../views/ProductManageView.vue'),
    meta: {
      requiresAuth: true,
      title: '商品管理',
      requiredPermission: 'product_view' as PermissionCode
    }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('../views/OrderListView.vue'),
    meta: {
      requiresAuth: true,
      title: '订单管理',
      requiredPermission: 'order_view' as PermissionCode
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: false, title: '关于我们' }
  },
  {
    path: '/permission-management',
    name: 'PermissionManagement',
    component: () => import('../views/PermissionManagementView.vue'),
    meta: {
      requiresAuth: true,
      title: '权限管理',
      requiredPermission: 'user_view' as PermissionCode
    }
  },
  {
    path: '/sales',
    name: 'SalesDashboard',
    component: () => import('../views/SalesDashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: '销售仪表盘',
      requiredPermission: 'dashboard_view' as PermissionCode
    }
  },
  {
    path: '/test-data',
    name: 'TestData',
    component: () => import('../views/TestDataView.vue'),
    meta: {
      requiresAuth: true,
      title: '数据测试'
    }
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('../views/UserCenterView.vue'),
    meta: {
      requiresAuth: true,
      title: '用户中心',
      requiredPermission: 'user_view' as PermissionCode
    }
  },
  {
    path: '/promotion-center',
    name: 'PromotionCenter',
    component: () => import('../views/PromotionCenterView.vue'),
    meta: {
      requiresAuth: true,
      title: '促销中心',
      requiredPermission: 'settings_view' as PermissionCode
    }
  },
  {
    path: '/content-management',
    name: 'ContentManagement',
    component: () => import('../views/ContentManagementView.vue'),
    meta: {
      requiresAuth: true,
      title: '内容管理',
      permissionCode: '内容管理查看'
    }
  },
  {
    path: '/purchase-center',
    name: 'PurchaseCenter',
    component: () => import('../views/PurchaseCenterView.vue'),
    meta: {
      requiresAuth: true,
      title: '采购中心',
      permissionCode: '采购管理查看'
    }
  },
  {
    path: '/wms-warehouse',
    name: 'WmsWarehouse',
    component: () => import('../views/WmsWarehouseView.vue'),
    meta: {
      requiresAuth: true,
      title: 'WMS仓库管理',
      permissionCode: '仓库管理查看'
    }
  },
  {
    path: '/dispatch-center',
    name: 'DispatchCenter',
    component: () => import('../views/DispatchCenterView.vue'),
    meta: {
      requiresAuth: true,
      title: '调度中心',
      permissionCode: '调度管理查看'
    }
  },
  {
    path: '/logistics-center',
    name: 'LogisticsCenter',
    component: () => import('../views/LogisticsCenterView.vue'),
    meta: {
      requiresAuth: true,
      title: '物流中心',
      requiredPermission: 'settings_view' as PermissionCode
    }
  },
  {
    path: '/permission-demo',
    name: 'PermissionDemo',
    component: () => import('../views/PermissionDemoView.vue'),
    meta: {
      requiresAuth: true,
      title: '权限系统演示',
      requiredPermission: 'dashboard_view' as PermissionCode
    }
  }
]

const router = createRouter({
  //history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})

// 使用新的权限守卫
router.beforeEach(createPermissionGuard())

export default router
