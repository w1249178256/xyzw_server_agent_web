import request from '../request'
import type { BaseResponse, LicenseStatus, LicenseInfo, LicenseActivateRequest } from '@/types/api'

/**
 * 获取 License 状态（不需要认证）
 * 返回: activated, status, serviceId, machineId 等
 */
export function getLicenseStatus(): Promise<BaseResponse<LicenseStatus>> {
  return request({
    url: '/license/status',
    method: 'get'
  })
}

/**
 * 获取服务信息（不需要认证）
 * 返回: serviceId, machineId, hardwareInfo 等
 */
export function getLicenseInfo(): Promise<BaseResponse<LicenseInfo>> {
  return request({
    url: '/license/info',
    method: 'get'
  })
}

/**
 * 激活 License
 * @param data.licenseData - base64编码的license内容
 */
export function activateLicense(data: LicenseActivateRequest): Promise<BaseResponse<LicenseStatus>> {
  return request({
    url: '/license/activate',
    method: 'post',
    data
  })
}

/**
 * 初始化 License（与 activate 功能相同）
 * @param data.licenseData - base64编码的license内容
 */
export function initLicense(data: LicenseActivateRequest): Promise<BaseResponse<LicenseStatus>> {
  return request({
    url: '/license/init',
    method: 'post',
    data
  })
}

/**
 * 重新加载 License
 */
export function reloadLicense(): Promise<BaseResponse<LicenseStatus>> {
  return request({
    url: '/license/reload',
    method: 'post'
  })
}
