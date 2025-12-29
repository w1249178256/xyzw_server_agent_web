import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from '@/utils/auth'
import type { BaseResponse } from '@/types/api'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001',
  timeout: 15000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const res = response.data as any
    console.log('API Response:', res)

    // 支持多种成功响应格式：
    // 1. code 为 200 或 0
    // 2. success 为 true
    const isSuccess = res.code === 200 || res.code === 0 || res.success === true

    if (!isSuccess) {
      ElMessage.error(res.msg || res.message || '请求失败')

      if (res.code === 401) {
        clearAuth()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.msg || res.message || '请求失败'))
    }

    // 统一响应格式
    if (res.success !== undefined && res.code === undefined) {
      res.code = res.success ? 0 : -1
    }

    return res
  },
  (error) => {
    console.error('Response error:', error)

    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      clearAuth()
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络错误，请稍后重试')
    }

    return Promise.reject(error)
  }
)

export default service

export function request<T = any>(config: AxiosRequestConfig): Promise<BaseResponse<T>> {
  return service(config)
}
