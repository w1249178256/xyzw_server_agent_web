import request from '../request'
import type {
  BaseResponse,
  BaseRequest,
  BindRequest,
  BindBody,
  BindRoleResult,
  RoleBody,
  SyncRoleDataRequest,
  Role,
  AddRoleRequest,
  DeleteRoleRequest,
  BatchAddRolesRequest,
  BatchAddRolesResponse,
  SendBindSmsCodeRequest,
  BindWithSmsCodeRequest
} from '@/types/api'

export function getBindList(data: BaseRequest): Promise<BaseResponse<BindBody>> {
  return request({
    url: '/user/get_bind_list',
    method: 'post',
    data
  })
}

export function bindAccount(data: BindRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/bind',
    method: 'post',
    data
  })
}

// 发送绑定验证码
export function sendBindSmsCode(
  data: SendBindSmsCodeRequest
): Promise<BaseResponse<string>> {
  return request({
    url: '/user/sendSmsCode',
    method: 'post',
    data
  })
}

// 使用验证码绑定账号
export function bindWithSmsCode(
  data: BindWithSmsCodeRequest
): Promise<BaseResponse<string>> {
  return request({
    url: '/user/bindWithSmsCode',
    method: 'post',
    data
  })
}

export function getGameRole(data: BindRoleResult): Promise<BaseResponse<RoleBody>> {
  return request({
    url: '/user/game_role',
    method: 'post',
    data
  })
}

export function syncRoleData(data: SyncRoleDataRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/available_roles',
    method: 'post',
    data
  })
}

// 获取绑定账号下的所有可用游戏角色
export function getAvailableRoles(data: SyncRoleDataRequest): Promise<BaseResponse<Role[]>> {
  return request({
    url: '/user/available_roles',
    method: 'post',
    data
  })
}

// 添加游戏角色到平台用户
export function addRole(data: AddRoleRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/add_role',
    method: 'post',
    data
  })
}

// 批量添加游戏角色到平台用户
export function batchAddRoles(
  data: BatchAddRolesRequest
): Promise<BaseResponse<BatchAddRolesResponse>> {
  return request({
    url: '/user/batch_add_roles',
    method: 'post',
    data
  })
}

// 删除已绑定的游戏角色
export function deleteRole(data: DeleteRoleRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/delete_role',
    method: 'post',
    data
  })
}
