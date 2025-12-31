<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ roleTitle }}</h2>
        <p v-if="roleInfo?.serverName || config.serverName" class="role-subtitle">
          {{ roleInfo?.serverName || config.serverName }}
          <span v-if="roleInfo?.level || config.level"> · Lv.{{ roleInfo?.level || config.level }}</span>
          <span v-if="roleInfo?.power || config.power" class="power-text"> · ⚔️{{ formatPower(roleInfo?.power || config.power || 0) }}</span>
        </p>
      </div>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：基础功能配置 -->
      <el-col :span="14">
        <el-card v-loading="loading">
          <div class="config-section">
            <h3>基础功能</h3>
            <el-form label-width="120px">
              <el-form-item label="每日任务">
                <el-switch v-model="config.dailyTaskEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="自动战斗">
                <el-switch v-model="config.autoBattleEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="自动升级">
                <el-switch v-model="config.autoUpgradeEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="瓶子功能">
                <el-switch v-model="config.bottleEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="竞技场">
                <el-switch v-model="config.arenaEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="军团">
                <el-switch v-model="config.legionEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="噩梦">
                <el-switch v-model="config.nightmareEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="好友批量">
                <el-switch v-model="config.friendBatchEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="商店自动购买">
                <el-switch v-model="config.storeAutoBuyEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>
              <el-form-item label="配置状态">
                <el-switch v-model="config.configStatus" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-form>
          </div>

          <el-divider />

          <!-- 任务调度配置 -->
          <div class="config-section">
            <h3>任务调度</h3>
            <el-form label-width="120px">
              <el-form-item label="每日任务时间">
                <el-time-picker
                  v-model="dailyTaskTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择执行时间"
                  style="width: 140px"
                />
                <span class="form-tip">每天该时间自动执行每日任务</span>
              </el-form-item>

              <el-form-item label="挂机续费">
                <el-switch v-model="config.battleRenewalEnabled" :active-value="1" :inactive-value="0" />
              </el-form-item>

              <el-form-item v-if="config.battleRenewalEnabled === 1" label="续费间隔">
                <el-input-number
                  v-model="config.battleRenewalInterval"
                  :min="5"
                  :max="1440"
                  :step="5"
                  style="width: 140px"
                />
                <span class="form-tip">分钟（建议 30-60 分钟）</span>
              </el-form-item>
            </el-form>
          </div>

          <div class="save-btn-container">
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：Token 授权 -->
      <el-col :span="10">
        <el-card v-loading="tokenLoading">
          <div class="config-section">
            <h3>授权 Token</h3>
            <el-alert
              type="warning"
              :closable="false"
              show-icon
              class="mb-15"
            >
              <template #title>
                开启后将生成一个授权链接，可用于第三方工具调用游戏接口
              </template>
            </el-alert>

            <el-form label-width="100px">
              <el-form-item label="启用授权">
                <el-switch
                  v-model="tokenEnabled"
                  :loading="tokenSwitching"
                  @change="handleTokenSwitch"
                />
              </el-form-item>
            </el-form>

            <div v-if="tokenEnabled && roleKey" class="token-url-section">
              <div class="token-label">授权链接</div>
              <div class="token-url-box">
                <el-input
                  v-model="tokenUrl"
                  readonly
                  size="small"
                >
                  <template #append>
                    <el-button @click="copyTokenUrl">
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
              <div class="token-tips">
                <el-text type="info" size="small">
                  请妥善保管此链接，不要泄露给他人
                </el-text>
              </div>

              <el-divider />

              <div class="token-label">快速获取 Token</div>
              <el-button type="primary" size="small" @click="fetchAndShowToken">
                获取当前 Token
              </el-button>
              <div v-if="currentToken" class="current-token">
                <el-input
                  v-model="currentToken"
                  type="textarea"
                  :rows="3"
                  readonly
                  size="small"
                />
                <el-button size="small" class="mt-10" @click="copyCurrentToken">
                  复制 Token
                </el-button>
              </div>
            </div>

            <el-empty v-else-if="!tokenEnabled" description="授权未启用" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRoleConfig, saveRoleConfig as saveConfigAPI } from '@/api/modules/roleConfig'
import { initRoleKey, deleteRoleKey, getToken, getRoleKeyList } from '@/api/modules/game'
import { getBindList, getGameRole } from '@/api/modules/account'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import type { GameRoleConfigEntity, RoleInfo } from '@/types/api'

const route = useRoute()
const roleId = ref(Number(route.params.roleId))
const loading = ref(false)
// 角色信息
const roleInfo = ref<RoleInfo | null>(null)

// Token 相关状态
const tokenLoading = ref(false)
const tokenSwitching = ref(false)
const tokenEnabled = ref(false)
const roleKey = ref('')
const currentToken = ref('')

// 生成授权 URL
const tokenUrl = computed(() => {
  if (!roleKey.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/api/game/getToken/${roleKey.value}`
})

// 角色标题显示
const roleTitle = computed(() => {
  const name = roleInfo.value?.roleName || config.roleName
  if (name) {
    return `角色配置 - ${name}`
  }
  return `角色配置 - 角色${roleId.value}`
})

const config = reactive<GameRoleConfigEntity>({
  // userId 由后端从 token 解析，前端不传
  roleId: roleId.value,
  dailyTaskEnabled: 0,
  autoBattleEnabled: 0,
  autoUpgradeEnabled: 0,
  bottleEnabled: 0,
  arenaEnabled: 0,
  legionEnabled: 0,
  nightmareEnabled: 0,
  friendBatchEnabled: 0,
  storeAutoBuyEnabled: 0,
  battleRenewalEnabled: 0,
  battleRenewalInterval: 30,
  configStatus: 1
})

// 每日任务执行时间（用于时间选择器）
const dailyTaskTime = ref<string>('08:00')

onMounted(async () => {
  await Promise.all([
    loadRoleInfo(),
    loadConfig(),
    loadRoleKeyStatus()
  ])
})

// 加载角色详细信息
async function loadRoleInfo() {
  try {
    // 获取绑定列表
    const bindRes = await getBindList({})
    const bindList = bindRes.data?.bindInfo || []

    // 遍历查找当前角色
    for (const bind of bindList) {
      try {
        const roleRes = await getGameRole({ bindId: bind.bindId })
        const roles = roleRes.data?.roleInfos || []
        const found = roles.find(r => r.roleId === roleId.value)
        if (found) {
          roleInfo.value = found
          // 合并到 config
          config.roleName = found.roleName
          config.serverName = found.serverName
          config.level = found.level
          config.power = found.power
          break
        }
      } catch (e) {
        console.warn(`获取绑定 ${bind.bindId} 的角色失败`, e)
      }
    }
  } catch (error) {
    console.warn('加载角色信息失败', error)
  }
}

async function loadConfig() {
  loading.value = true
  try {
    const res = await getRoleConfig({
      roleId: roleId.value
    })
    if (res.data?.data) {
      Object.assign(config, res.data.data)
      // 如果角色信息已加载，保留角色信息
      if (roleInfo.value) {
        config.roleName = roleInfo.value.roleName
        config.serverName = roleInfo.value.serverName
        config.level = roleInfo.value.level
        config.power = roleInfo.value.power
      }
      // 设置每日任务执行时间
      dailyTaskTime.value = res.data.data.dailyTaskExecuteTimeOrDefault
        || res.data.data.dailyTaskExecuteTime
        || '08:00'
      // 设置挂机续费间隔默认值
      if (!config.battleRenewalInterval) {
        config.battleRenewalInterval = res.data.data.battleRenewalIntervalOrDefault || 30
      }
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 加载角色 Key 状态
async function loadRoleKeyStatus() {
  tokenLoading.value = true
  try {
    const res = await getRoleKeyList({})
    if (res.data) {
      // 查找当前角色是否有 key
      const found = res.data.find((item: any) =>
        item.roleId === roleId.value || item.roleName === config.roleName
      )
      if (found?.key) {
        tokenEnabled.value = true
        roleKey.value = found.key
      }
    }
  } catch (error) {
    console.error('加载 roleKey 状态失败:', error)
  } finally {
    tokenLoading.value = false
  }
}

// 处理 Token 开关切换
async function handleTokenSwitch(val: boolean) {
  if (val) {
    // 启用授权
    await enableToken()
  } else {
    // 禁用授权
    try {
      await ElMessageBox.confirm(
        '关闭授权后，之前生成的链接将失效，确定要关闭吗？',
        '确认关闭',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await disableToken()
    } catch {
      // 用户取消，恢复开关状态
      tokenEnabled.value = true
    }
  }
}

async function enableToken() {
  tokenSwitching.value = true
  try {
    const res = await initRoleKey({ roleId: roleId.value })
    if (res.code === 0 && res.data?.key) {
      roleKey.value = res.data.key
      ElMessage.success('授权已启用')
    } else {
      tokenEnabled.value = false
      ElMessage.error(res.msg || '启用授权失败')
    }
  } catch (error) {
    tokenEnabled.value = false
    ElMessage.error('启用授权失败')
  } finally {
    tokenSwitching.value = false
  }
}

async function disableToken() {
  tokenSwitching.value = true
  try {
    const res = await deleteRoleKey({ roleId: roleId.value })
    if (res.code === 0) {
      roleKey.value = ''
      currentToken.value = ''
      ElMessage.success('授权已关闭')
    } else {
      tokenEnabled.value = true
      ElMessage.error(res.msg || '关闭授权失败')
    }
  } catch (error) {
    tokenEnabled.value = true
    ElMessage.error('关闭授权失败')
  } finally {
    tokenSwitching.value = false
  }
}

// 获取并显示当前 Token
async function fetchAndShowToken() {
  if (!roleKey.value) {
    ElMessage.warning('请先启用授权')
    return
  }
  tokenLoading.value = true
  try {
    const res = await getToken(roleKey.value)
    if (res.code === 0 && res.token) {
      currentToken.value = res.token
    } else {
      ElMessage.error(res.msg || '获取 Token 失败')
    }
  } catch (error) {
    ElMessage.error('获取 Token 失败')
  } finally {
    tokenLoading.value = false
  }
}

// 复制授权链接
async function copyTokenUrl() {
  try {
    await navigator.clipboard.writeText(tokenUrl.value)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 复制当前 Token
async function copyCurrentToken() {
  try {
    await navigator.clipboard.writeText(currentToken.value)
    ElMessage.success('Token 已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

async function saveConfig() {
  loading.value = true
  try {
    // 将每日任务时间保存到 config
    config.dailyTaskExecuteTime = dailyTaskTime.value
    await saveConfigAPI(config)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 格式化战力显示
function formatPower(power: number): string {
  if (power >= 100000000) {
    return (power / 100000000).toFixed(2) + '亿'
  } else if (power >= 10000) {
    return (power / 10000).toFixed(2) + '万'
  }
  return power.toLocaleString()
}
</script>

<style scoped>
.role-subtitle {
  margin: 8px 0 0 0;
  color: #606266;
  font-size: 14px;
  font-weight: normal;
}

.power-text {
  color: #f56c6c;
  font-weight: 600;
}

.config-section {
  max-width: 600px;
}

.config-section h3 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* Token 授权部分样式 */
.mb-15 {
  margin-bottom: 15px;
}

.mt-10 {
  margin-top: 10px;
}

.token-url-section {
  margin-top: 16px;
}

.token-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.token-url-box {
  margin-bottom: 8px;
}

.token-tips {
  margin-bottom: 10px;
}

.current-token {
  margin-top: 12px;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.save-btn-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
