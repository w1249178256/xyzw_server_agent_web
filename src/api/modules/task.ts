import request from '../request'
import type {
  BaseResponse,
  GameTaskEntity,
  CharmBuyTaskRequest,
  GameRegetRequest,
  RoleDailyTaskRequest,
  TaskResult,
  HealthStatus,
  SchedulerConfig
} from '@/types/api'

export function getTaskList(roleId?: number): Promise<BaseResponse<GameTaskEntity[]>> {
  return request({
    url: '/game/task/list',
    method: 'get',
    params: { roleId }
  })
}

export function toggleTask(taskId: number, enabled: boolean): Promise<BaseResponse<string>> {
  return request({
    url: `/game/task/${taskId}/toggle`,
    method: 'post',
    params: { enabled }
  })
}

export function deleteTask(taskId: number): Promise<BaseResponse<string>> {
  return request({
    url: `/game/task/${taskId}`,
    method: 'delete'
  })
}

export function createCharmBuyTask(data: CharmBuyTaskRequest): Promise<BaseResponse<number>> {
  return request({
    url: '/game/task/charm-buy',
    method: 'post',
    data
  })
}

export function createBattleRenewalHangupTask(data: GameRegetRequest): Promise<BaseResponse<number>> {
  return request({
    url: '/game/task/battle-renewal-hangup',
    method: 'post',
    data
  })
}

export function executeAllDailyTasks(): Promise<BaseResponse<any>> {
  return request({
    url: '/daily-task/execute-all',
    method: 'post'
  })
}

export function executeRoleDailyTask(data: RoleDailyTaskRequest): Promise<BaseResponse<any>> {
  return request({
    url: '/daily-task/execute-role',
    method: 'post',
    data
  })
}

export function getSchedulerStatus(): Promise<BaseResponse<TaskResult>> {
  return request({
    url: '/daily-task/status',
    method: 'get'
  })
}

export function getSchedulerConfig(): Promise<BaseResponse<SchedulerConfig>> {
  return request({
    url: '/daily-task/config',
    method: 'get'
  })
}

export function getDailyTaskHealth(): Promise<BaseResponse<HealthStatus>> {
  return request({
    url: '/daily-task/health',
    method: 'get'
  })
}
