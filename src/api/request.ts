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
    const res = response.data
    console.log('API Response:', res)

    // 支持 code 为 200 或 0 表示成功
    if (res.code !== 200 && res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')

      if (res.code === 401) {
        clearAuth()
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.msg || '请求失败'))
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
