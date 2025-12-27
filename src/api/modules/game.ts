import request from '../request'
import type {
  BaseResponse,
  GameRequest,
  GameRoleKey,
  RoleKeyRequest,
  GameLoginRequest,
  DailyTaskResponse,
  CarSendRequest,
  CarRefreshRequest,
  CarClaimRequest,
  TokenResponse
} from '@/types/api'

export function getRoleKeyList(data: any): Promise<BaseResponse<GameRoleKey[]>> {
  return request({
    url: '/game/roleKey/list',
    method: 'post',
    data
  })
}

export function initRoleKey(data: RoleKeyRequest): Promise<BaseResponse<GameRoleKey>> {
  return request({
    url: '/game/roleKey/init',
    method: 'post',
    data
  })
}

export function deleteRoleKey(data: RoleKeyRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/game/roleKey/delete',
    method: 'post',
    data
  })
}

export function getToken(roleKey: string): Promise<TokenResponse> {
  return request({
    url: `/game/getToken/${roleKey}`,
    method: 'get'
  })
}

export function gameLogin(data: GameLoginRequest): Promise<BaseResponse<string>> {
  return request({
    url: '/game/login',
    method: 'post',
    data
  })
}

export function getRoleInfo(data: GameRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/getRoleInfo',
    method: 'post',
    data
  })
}

export function executeDailyTask(data: GameRequest): Promise<BaseResponse<DailyTaskResponse>> {
  return request({
    url: '/game/dailyTask',
    method: 'post',
    data
  })
}

export function completeMonthlyTasks(data: GameRequest): Promise<BaseResponse<Record<string, any>>> {
  return request({
    url: '/game/completeMonthlyTasks',
    method: 'post',
    data
  })
}

export function climbTower(data: GameRequest): Promise<BaseResponse<Record<string, any>>> {
  return request({
    url: '/game/climbTower',
    method: 'post',
    data
  })
}

export function collectionClaimFree(data: GameRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/collection/claimFree',
    method: 'post',
    data
  })
}

export function carSend(data: CarSendRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/car/send',
    method: 'post',
    data
  })
}

export function carRefresh(data: CarRefreshRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/car/refresh',
    method: 'post',
    data
  })
}

export function carClaim(data: CarClaimRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/car/claim',
    method: 'post',
    data
  })
}

export function carGetRoleCar(data: GameRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/car/getRoleCar',
    method: 'post',
    data
  })
}

export function carListSimple(data: GameRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/game/car/listSimple',
    method: 'post',
    data
  })
}
