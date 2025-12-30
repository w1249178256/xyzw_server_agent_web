import request from '../request'
import type { BaseRequest, BaseResponse, WxBindRequest, WxUserInfo } from '@/types/api'

export function wxBind(data: WxBindRequest): Promise<BaseResponse<WxUserInfo>> {
  return request({
    url: '/user/wx_bind',
    method: 'post',
    data
  })
}

export function wxBindStatus(data: BaseRequest): Promise<BaseResponse<WxUserInfo>> {
  return request({
    url: '/user/wx_bind_status',
    method: 'post',
    data
  })
}

export function wxUnbind(data: BaseRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/wx_unbind',
    method: 'post',
    data
  })
}
