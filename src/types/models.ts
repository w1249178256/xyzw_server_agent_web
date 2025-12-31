// 用户模型
export interface User {
  userId: number
  username: string
  token: string
}

// 游戏账号绑定模型
export interface GameBind {
  bindId: number
  remark: string
  roles?: GameRole[]
}

// 游戏角色模型
export interface GameRole {
  roleId: number
  serverName: string
  roleName: string
  level?: number // 角色等级（可选）
  power?: number // 战力（可选）
  config?: RoleConfig
}

// 角色配置模型
export interface RoleConfig {
  id: number
  userId: number
  roleId: number
  // 角色信息字段（可选）
  roleName?: string
  serverName?: string
  level?: number
  power?: number
  dailyTaskEnabled: boolean
  autoBattleEnabled: boolean
  autoUpgradeEnabled: boolean
  bottleEnabled: boolean
  arenaEnabled: boolean
  legionEnabled: boolean
  nightmareEnabled: boolean
  friendBatchEnabled: boolean
  storeAutoBuyEnabled: boolean
  configStatus: number
  createTime: string
  updateTime: string
}

// 任务模型
export interface GameTask {
  id?: number
  userId?: number
  roleId: number
  taskName: string
  taskType: string
  cronExpression?: string
  executionMode?: string // 执行模式
  intervalMinutes?: number // 间隔分钟数
  executeTime?: string // 执行时间
  timeEditable?: number // 时间是否可编辑
  taskConfig: any
  status: TaskStatus
  lastExecuteTime?: string
  nextExecuteTime?: string
  executeCount: number
  successCount: number
  failCount: number
  createTime?: string
  updateTime?: string
  maxRetryCount?: number
  currentRetryCount?: number
  retryInterval?: number
  retryStrategy?: string
  lastErrorMessage?: string
  nextRetryTime?: string
}

// 任务状态枚举
export enum TaskStatus {
  DISABLED = 0,
  ENABLED = 1,
  RUNNING = 2,
  PAUSED = 3,
  FAILED = 4
}

// 任务类型枚举
export enum TaskType {
  DAILY_TASK = 'DAILY_TASK',
  CHARM_BUY = 'CHARM_BUY',
  BATTLE_RENEWAL_HANGUP = 'BATTLE_RENEWAL_HANGUP',
  CUSTOM = 'CUSTOM'
}

// 配置状态枚举
export enum ConfigStatus {
  DISABLED = 0,
  ENABLED = 1
}
