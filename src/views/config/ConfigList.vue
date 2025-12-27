<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">角色配置管理</h2>
    </div>

    <el-card>
      <el-alert
        title="提示"
        type="info"
        description="请先在游戏账号页面绑定账号并同步角色后，再进行配置管理"
        :closable="false"
        show-icon
        class="mb-20"
      />

      <el-table :data="configs" v-loading="loading" style="width: 100%">
        <el-table-column prop="roleId" label="角色ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column label="每日任务" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.dailyTaskEnabled"
              :active-value="1"
              :inactive-value="0"
              @change="updateConfig(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="自动战斗" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.autoBattleEnabled"
              :active-value="1"
              :inactive-value="0"
              @change="updateConfig(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.configStatus === 1 ? 'success' : 'info'">
              {{ row.configStatus === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToDetail(row.roleId)">
              详细配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getRoleConfigList, saveRoleConfig } from '@/api/modules/roleConfig'
import { ElMessage } from 'element-plus'
import type { GameRoleConfigEntity } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

const configs = ref<GameRoleConfigEntity[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadConfigs()
})

async function loadConfigs() {
  loading.value = true
  try {
    const res = await getRoleConfigList({ userId: userStore.userId })
    if (res.data?.data) {
      configs.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

async function updateConfig(config: GameRoleConfigEntity) {
  try {
    await saveRoleConfig(config)
    ElMessage.success('更新成功')
  } catch (error) {
    ElMessage.error('更新失败')
    await loadConfigs()
  }
}

function goToDetail(roleId: number) {
  router.push(`/config/${roleId}`)
}
</script>
