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

// 微信绑定相关
export interface WxUserInfo {
  userId: number
  username: string
  openId: string
  nickname: string
  avatarUrl: string
  wxBound: boolean
  token?: string
}

export interface WxBindRequest {
  userId?: number
  code: string
  openId?: string
  unionId?: string
  nickname?: string
  avatarUrl?: string
}

// 游戏账号绑定 - 发送验证码
export interface SendBindSmsCodeRequest {
  phone: string
}

// 游戏账号绑定 - 使用验证码绑定
export interface BindWithSmsCodeRequest {
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
  level?: number // 角色等级（可选）
  power?: number // 战力（可选）
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
  serverId: string
}

export interface DeleteRoleRequest {
  roleId: number
}

// 角色选择项
export interface RoleSelection {
  gameRoleId: number
  serverId: string
}

// 批量添加角色请求
export interface BatchAddRolesRequest {
  bindId: number
  roleSelections: RoleSelection[]
}

// 批量添加角色响应
export interface BatchAddRolesResponse {
  totalCount: number
  successCount: number
  failedCount: number
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
  userId?: number // 可选：由后端从 token 解析，前端不传
  roleId: number
  // 角色信息字段（由后端返回，前端不传）
  roleName?: string // 角色名称
  serverName?: string // 服务器名称
  level?: number // 角色等级
  power?: number // 战力
  // 功能开关
  dailyTaskEnabled: number
  autoBattleEnabled: number
  autoUpgradeEnabled: number
  bottleEnabled: number
  arenaEnabled: number
  legionEnabled: number
  nightmareEnabled: number
  friendBatchEnabled: number
  storeAutoBuyEnabled: number
  battleRenewalEnabled?: number // 挂机续费开关
  charmBuyEnabled?: number // 符咒购买开关
  // 任务调度配置
  dailyTaskExecuteTime?: string // 每日任务执行时间 (HH:mm 格式)
  battleRenewalInterval?: number // 挂机续费间隔 (分钟)
  // 带默认值的字段（后端返回）
  dailyTaskExecuteTimeOrDefault?: string
  battleRenewalIntervalOrDefault?: number
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

// 任务调度配置
export interface TaskScheduleConfig {
  dailyTaskExecuteTime?: string // 每日任务执行时间 (HH:mm 格式)
  battleRenewalInterval?: number // 挂机续费间隔 (分钟)
}

export interface BatchUpdateRequest {
  roleId: number
  features?: Record<string, number>
  taskSchedule?: TaskScheduleConfig
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
  taskConfig?: string
  status: number
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

// License 相关类型
export interface LicenseStatus {
  valid: boolean
  activated: boolean
  status?: string  // UNACTIVATED, ACTIVATED, EXPIRED 等
  serviceId?: string
  machineId?: string
  expireTime?: string
  remainingDays?: number
  message?: string
  licenseInfo?: LicenseInfo
  usage?: any
  [key: string]: any
}

export interface LicenseInfo {
  serviceName?: string
  version?: string
  serviceId?: string
  machineId?: string
  hardwareInfo?: any
  [key: string]: any
}

export interface LicenseActivateRequest {
  licenseData: string  // base64编码的license内容
}
