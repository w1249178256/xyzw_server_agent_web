import request from '../request'
import type {
  BaseResponse,
  BaseRequest,
  RoleConfigRequest,
  RoleConfigResponse,
  RoleConfigListResponse,
  GameRoleConfigEntity,
  ConfigStatusRequest,
  ConfigStatusResponse,
  CreateDefaultConfigRequest,
  FeatureCheckRequest,
  FeatureCheckResponse,
  BatchUpdateRequest,
  BatchUpdateResponse
} from '@/types/api'

export function getRoleConfigList(data: BaseRequest): Promise<BaseResponse<RoleConfigListResponse>> {
  return request({
    url: '/role-config/list',
    method: 'post',
    data
  })
}

export function getRoleConfig(data: RoleConfigRequest): Promise<BaseResponse<RoleConfigResponse>> {
  return request({
    url: '/role-config/detail',
    method: 'post',
    data
  })
}

export function saveRoleConfig(data: GameRoleConfigEntity): Promise<BaseResponse<RoleConfigResponse>> {
  return request({
    url: '/role-config/save',
    method: 'post',
    data
  })
}

export function updateConfigStatus(data: ConfigStatusRequest): Promise<BaseResponse<ConfigStatusResponse>> {
  return request({
    url: '/role-config/update-status',
    method: 'post',
    data
  })
}

export function createDefaultConfig(data: CreateDefaultConfigRequest): Promise<BaseResponse<RoleConfigResponse>> {
  return request({
    url: '/role-config/create-default',
    method: 'post',
    data
  })
}

export function checkFeature(data: FeatureCheckRequest): Promise<BaseResponse<FeatureCheckResponse>> {
  return request({
    url: '/role-config/check-feature',
    method: 'post',
    data
  })
}

export function batchUpdateFeatures(data: BatchUpdateRequest): Promise<BaseResponse<BatchUpdateResponse>> {
  return request({
    url: '/role-config/batch-update',
    method: 'post',
    data
  })
}

export function initUserConfigs(data: BaseRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/role-config/init-user-configs',
    method: 'post',
    data
  })
}

export function getEnabledDailyTaskRoles(): Promise<BaseResponse<RoleConfigListResponse>> {
  return request({
    url: '/role-config/enabled-daily-task',
    method: 'post'
  })
}
