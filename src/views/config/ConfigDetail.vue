<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ roleTitle }}</h2>
        <p v-if="config.serverName" class="role-subtitle">
          {{ config.serverName }}
          <span v-if="config.level"> · Lv.{{ config.level }}</span>
          <span v-if="config.power" class="power-text"> · ⚔️{{ formatPower(config.power) }}</span>
        </p>
      </div>
      <el-button @click="$router.back()">返回</el-button>
    </div>

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

        <el-button type="primary" @click="saveConfig">保存配置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRoleConfig, saveRoleConfig as saveConfigAPI } from '@/api/modules/roleConfig'
import { ElMessage } from 'element-plus'
import type { GameRoleConfigEntity } from '@/types/api'

const route = useRoute()
const roleId = ref(Number(route.params.roleId))
const loading = ref(false)

// 角色标题显示
const roleTitle = computed(() => {
  if (config.roleName) {
    return `角色配置 - ${config.roleName}`
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
  configStatus: 1
})

onMounted(async () => {
  await loadConfig()
})

async function loadConfig() {
  loading.value = true
  try {
    const res = await getRoleConfig({
      roleId: roleId.value
    })
    if (res.data?.data) {
      Object.assign(config, res.data.data)
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  loading.value = true
  try {
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
</style>
