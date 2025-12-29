import request from '../request'
import type {
  BaseResponse,
  WxLoginRequest,
  WxBindRequest,
  WxUserInfo
} from '@/types/api'

/**
 * 微信登录（用授权码换取用户信息和 token）
 */
export function wxLogin(data: WxLoginRequest): Promise<BaseResponse<WxUserInfo>> {
  return request({
    url: '/user/wx_login',
    method: 'post',
    data
  })
}

/**
 * 绑定微信账号到当前用户
 */
export function wxBind(data: WxBindRequest): Promise<BaseResponse<WxUserInfo>> {
  return request({
    url: '/user/wx_bind',
    method: 'post',
    data
  })
}

/**
 * 查询当前用户的微信绑定状态
 */
export function wxBindStatus(): Promise<BaseResponse<WxUserInfo>> {
  return request({
    url: '/user/wx_bind_status',
    method: 'post',
    data: {}
  })
}

/**
 * 解绑微信账号
 */
export function wxUnbind(): Promise<BaseResponse<string>> {
  return request({
    url: '/user/wx_unbind',
    method: 'post',
    data: {}
  })
}
