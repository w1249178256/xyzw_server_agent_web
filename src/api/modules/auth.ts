import request from '../request'
import type {
  BaseResponse,
  LoginRequest,
  LoginBody,
  SendSmsCodeRequest,
  LoginWithSmsCodeRequest
} from '@/types/api'

export function login(data: LoginRequest): Promise<BaseResponse<LoginBody>> {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function register(data: LoginRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function sendSmsCode(data: SendSmsCodeRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/user/sendSmsCode',
    method: 'post',
    data
  })
}

export function loginWithSmsCode(data: LoginWithSmsCodeRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/user/bindWithSmsCode',
    method: 'post',
    data
  })
}
