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
  DeleteRoleRequest
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

export function getGameRole(data: BindRoleResult): Promise<BaseResponse<RoleBody>> {
  return request({
    url: '/user/game_role',
    method: 'post',
    data
  })
}

export function syncRoleData(data: SyncRoleDataRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/sync_role_data',
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

// 删除已绑定的游戏角色
export function deleteRole(data: DeleteRoleRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/user/delete_role',
    method: 'post',
    data
  })
}
