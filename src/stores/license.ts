import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getLicenseStatus,
  getLicenseInfo,
  activateLicense,
  reloadLicense
} from '@/api/modules/license'
import type { LicenseStatus, LicenseInfo } from '@/types/api'

export const useLicenseStore = defineStore('license', () => {
  // 状态
  const licenseStatus = ref<LicenseStatus | null>(null)
  const licenseInfo = ref<LicenseInfo | null>(null)
  const loading = ref(false)
  const checked = ref(false) // 是否已检查过

  // 计算属性
  // 优先以 status 字段判断，其次是 valid 字段
  const isValid = computed(() => {
    const status = licenseStatus.value?.status
    // 如果有 status 字段，以 status 为准
    if (status) {
      return status === 'ACTIVATED' || status === 'VALID'
    }
    // 否则检查 valid 字段
    return licenseStatus.value?.valid === true
  })
  const isActivated = computed(() => {
    const status = licenseStatus.value?.status
    if (status) {
      return status === 'ACTIVATED' || status === 'VALID'
    }
    return licenseStatus.value?.activated === true
  })
  const expireTime = computed(() => licenseStatus.value?.expireTime)
  const remainingDays = computed(() => licenseStatus.value?.remainingDays)

  // 检查 License 状态
  async function checkLicenseStatus(): Promise<boolean> {
    loading.value = true
    try {
      const res = await getLicenseStatus() as any
      // 支持 code: 200/0 或 success: true
      const isRequestSuccess = res.code === 200 || res.code === 0 || res.success === true
      if (isRequestSuccess) {
        licenseStatus.value = res.data
        checked.value = true
        // 以 status 字段为准判断是否激活
        const status = res.data?.status
        if (status) {
          return status === 'ACTIVATED' || status === 'VALID'
        }
        return res.data?.valid === true
      }
      // 请求失败，可能是服务未启动或网络问题
      licenseStatus.value = {
        valid: false,
        activated: false,
        message: res.msg || res.message || '无法连接到服务'
      }
      checked.value = true
      return false
    } catch (error: any) {
      console.error('Failed to check license status:', error)
      licenseStatus.value = {
        valid: false,
        activated: false,
        message: error?.message || '服务连接失败'
      }
      checked.value = true
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取服务信息
  async function fetchLicenseInfo() {
    try {
      const res = await getLicenseInfo() as any
      const isSuccess = res.code === 200 || res.code === 0 || res.success === true
      if (isSuccess) {
        licenseInfo.value = res.data
        return res.data
      }
      // 非成功响应，清空信息但不报错（可能是未激活状态）
      licenseInfo.value = null
      return null
    } catch (error: any) {
      // 静默处理错误，未激活时获取信息失败是正常情况
      console.warn('License info not available:', error?.message || error)
      licenseInfo.value = null
      return null
    }
  }

  // 激活 License
  // @param licenseData - base64编码的license内容
  async function activate(licenseData: string) {
    loading.value = true
    try {
      const res = await activateLicense({ licenseData }) as any
      const isSuccess = res.code === 200 || res.code === 0 || res.success === true
      if (isSuccess) {
        // 激活成功后更新状态
        licenseStatus.value = res.data
        return { success: true, message: '激活成功' }
      }
      return { success: false, message: res.msg || res.message || '激活失败' }
    } catch (error: any) {
      console.error('Failed to activate license:', error)
      return { success: false, message: error?.message || '激活失败' }
    } finally {
      loading.value = false
    }
  }

  // 重新加载 License
  async function reload() {
    loading.value = true
    try {
      const res = await reloadLicense() as any
      const isSuccess = res.code === 200 || res.code === 0 || res.success === true
      if (isSuccess) {
        // 重载后更新状态
        licenseStatus.value = res.data
        return { success: true, message: '重载成功' }
      }
      return { success: false, message: res.msg || res.message || '重载失败' }
    } catch (error: any) {
      console.error('Failed to reload license:', error)
      return { success: false, message: error?.message || '重载失败' }
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  function reset() {
    licenseStatus.value = null
    licenseInfo.value = null
    checked.value = false
  }

  return {
    licenseStatus,
    licenseInfo,
    loading,
    checked,
    isValid,
    isActivated,
    expireTime,
    remainingDays,
    checkLicenseStatus,
    fetchLicenseInfo,
    activate,
    reload,
    reset
  }
})
