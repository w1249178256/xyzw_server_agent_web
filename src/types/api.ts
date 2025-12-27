// 通用响应类型
export interface BaseResponse<T = any> {
  code: number
  msg: string
  data: T
}

// 用户认证相关
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginBody {
  token: string
  userId?: number // 可选：如果后端返回了就使用
}

export interface SendSmsCodeRequest {
  phone: string
}

export interface LoginWithSmsCodeRequest {
  phone: string
  smsCode: string
}

// 游戏账号绑定相关
export interface BaseRequest {
  // 不需要 userId，后端从 token 解析
}

export interface BindRequest {
  context: string
  remark?: string
}

export interface BindInfo {
  bindId: number
  remark: string
}

export interface BindBody {
  bindInfo: BindInfo[]
}

export interface BindRoleResult {
  bindId: number
  roleId?: number // 非必传，查询所有角色时不传
}

export interface RoleInfo {
  roleId: number
  serverName: string
  roleName: string
}

export interface RoleBody {
  roleInfos: RoleInfo[]
}

export interface SyncRoleDataRequest {
  bindId: number
}

// 新增：角色相关类型
export interface Role {
  roleId: number
  serverId: string
  serverName: string
  name: string
  level: number
  power: number
  lordSkinId: number
  lordSkinExpireTime: string
  loginAt: string
}

export interface AddRoleRequest {
  bindId: number
  gameRoleId: number
  serverId: number
  serverName: string
  roleName: string
  roleLevel: number
}

export interface DeleteRoleRequest {
  roleId: number
}

// 游戏角色配置相关
export interface RoleConfigRequest {
  roleId: number
}

export interface CreateDefaultConfigRequest {
  roleId: number
}

export interface ConfigStatusRequest {
  roleId: number
  status: number
}

export interface ConfigStatusResponse {
  roleId: number
  status: number
}

export interface GameRoleConfigEntity {
  id?: number
  userId: number
  roleId: number
  dailyTaskEnabled: number
  autoBattleEnabled: number
  autoUpgradeEnabled: number
  bottleEnabled: number
  arenaEnabled: number
  legionEnabled: number
  nightmareEnabled: number
  friendBatchEnabled: number
  storeAutoBuyEnabled: number
  configStatus: number
  createTime?: string
  updateTime?: string
}

export interface RoleConfigResponse {
  data: GameRoleConfigEntity
}

export interface RoleConfigListResponse {
  data: GameRoleConfigEntity[]
  total: number
}

export interface FeatureCheckRequest {
  roleId: number
  featureName: string
}

export interface FeatureCheckResponse {
  roleId: number
  featureName: string
  enabled: boolean
}

export interface BatchUpdateRequest {
  roleId: number
  features: Record<string, number>
}

export interface BatchUpdateResponse {
  data: GameRoleConfigEntity
  updatedFeatures: string[]
}

// 任务相关
export interface GameRequest {
  roleId: number
}

export interface GameTaskEntity {
  id: number
  userId: number
  roleId: number
  taskName: string
  taskType: string
  cronExpression: string
  taskConfig: string
  status: number
  lastExecuteTime?: string
  nextExecuteTime?: string
  executeCount: number
  successCount: number
  failCount: number
  createTime: string
  updateTime: string
  maxRetryCount: number
  currentRetryCount: number
  retryInterval: number
  retryStrategy: string
  lastErrorMessage?: string
  nextRetryTime?: string
}

export interface CharmBuyTaskRequest {
  roleId: number
  taskName: string
  charmId: number
  buyNum: number
  cronExpression: string
}

export interface GameRegetRequest {
  roleId: number
}

export interface RoleDailyTaskRequest {
  roleId: number
}

export interface DailyTaskResponse {
  currentStep: string
  status: string
  roleData: any
  message: string
  progress: number
  nextStep: string
  taskDetails: any
}

export interface TaskResult {
  status: boolean
  task: Record<string, any>
}

export interface HealthStatus {
  status: string
  service: string
  timestamp: number
}

export interface SchedulerConfig {
  scheduleCron: string
  scheduleDescription: string
  concurrentThreads: number
  autoExecute: boolean
}

// 游戏相关
export interface GameRoleKey {
  roleName: string
  key: string
}

export interface RoleKeyRequest {
  roleId: number
}

export interface GameLoginRequest {
  roleId: number
}

export interface CarSendRequest {
  roleId: number
  carId: string
  helperId: number
  text: string
  isUpgrade: boolean
}

export interface CarRefreshRequest {
  roleId: number
  carId: string
}

export interface CarClaimRequest {
  roleId: number
  carId: string
}

export interface TokenResponse {
  code: number
  msg: string
  token: string
}
