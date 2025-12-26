import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginRequest, LoginResponse, UserInfo } from '../types/auth'

// 模拟登录API
const mockLogin = async (params: LoginRequest): Promise<LoginResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟登录验证
  if (params.username === 'admin' && params.password === '123456') {
    return {
      token: 'mock-jwt-token-' + Date.now(),
      userInfo: {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        role: 'admin',
        avatar: 'https://picsum.photos/id/1/100/100',
        permissions: ['系统管理查看', '商品管理查看', '订单管理查看', '用户管理查看', '权限管理查看', '促销管理查看', '内容管理查看', '采购管理查看', '仓库管理查看', '调度管理查看', '物流管理查看']
      },
      expiresIn: 3600
    }
  } else {
    // 模拟普通用户
    return {
      token: 'mock-jwt-token-user-' + Date.now(),
      userInfo: {
        id: 2,
        username: params.username,
        nickname: params.username,
        role: 'user',
        avatar: 'https://picsum.photos/id/2/100/100',
        permissions: ['商品管理查看', '订单管理查看']
      },
      expiresIn: 3600
    }
  }
}

// Token存储键名
const TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const userInfo = ref<UserInfo | null>(JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null'))
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const login = async (params: LoginRequest): Promise<void> => {
    loading.value = true
    try {
      const response = await mockLogin(params)
      
      // 存储token和用户信息
      token.value = response.token
      userInfo.value = response.userInfo
      
      // 保存到localStorage
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.userInfo))
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    // 清除状态
    token.value = null
    userInfo.value = null
    
    // 从localStorage移除
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  const getUserInfo = (): UserInfo | null => {
    return userInfo.value
  }

  return {
    token,
    userInfo,
    loading,
    isAuthenticated,
    login,
    logout,
    getUserInfo
  }
})