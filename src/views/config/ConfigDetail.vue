<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">角色配置详情 - {{ roleId }}</h2>
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRoleConfig, saveRoleConfig as saveConfigAPI } from '@/api/modules/roleConfig'
import { ElMessage } from 'element-plus'
import type { GameRoleConfigEntity } from '@/types/api'

const route = useRoute()
const userStore = useUserStore()

const roleId = ref(Number(route.params.roleId))
const loading = ref(false)

const config = reactive<GameRoleConfigEntity>({
  userId: userStore.userId,
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
      userId: userStore.userId,
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
</script>

<style scoped>
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
