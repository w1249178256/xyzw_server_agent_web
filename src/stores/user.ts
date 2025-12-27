import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register } from '@/api/modules/auth'
import { setToken, setUserInfo, clearAuth, getToken, getUserInfo } from '@/utils/auth'
import type { LoginRequest } from '@/types/api'
import type { User } from '@/types/models'

// 从 JWT Token 中解析 userId
function parseUserIdFromToken(token: string): number {
  try {
    // JWT token 格式: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format')
      return 0
    }

    // 解码 payload (base64)
    const payload = JSON.parse(atob(parts[1]))
    console.log('JWT Payload:', payload)

    // 尝试从 payload 中获取 userId (可能的字段名: userId, uid, sub, id)
    return payload.userId || payload.uid || payload.sub || payload.id || 0
  } catch (error) {
    console.error('Failed to parse JWT token:', error)
    return 0
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(getUserInfo())
  const token = ref<string | null>(getToken())

  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => user.value?.userId || 0)
  const username = computed(() => user.value?.username || '')

  async function loginAction(loginData: LoginRequest) {
    try {
      const res = await login(loginData)
      console.log('Login response:', res)
      if (res.data?.token) {
        token.value = res.data.token
        setToken(res.data.token)

        // 优先使用后端返回的 userId，如果没有则从 token 中解析
        let parsedUserId = res.data.userId
        if (!parsedUserId) {
          parsedUserId = parseUserIdFromToken(res.data.token)
          console.log('Parsed userId from token:', parsedUserId)
        }

        const userInfo: User = {
          userId: parsedUserId,
          username: loginData.username,
          token: res.data.token
        }
        user.value = userInfo
        setUserInfo(userInfo)

        return true
      }
      console.warn('No token in response:', res)
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async function registerAction(registerData: LoginRequest) {
    try {
      const res = await register(registerData)
      return res.code === 200
    } catch (error) {
      console.error('Register failed:', error)
      return false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    clearAuth()
  }

  function setUserId(id: number) {
    if (user.value) {
      user.value.userId = id
      setUserInfo(user.value)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    userId,
    username,
    loginAction,
    registerAction,
    logout,
    setUserId
  }
})
