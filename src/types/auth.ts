export interface LoginRequest {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  role: string
  avatar?: string
  permissions: string[]
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
  expiresIn: number
}

export interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  isAuthenticated: boolean
  loading: boolean
}