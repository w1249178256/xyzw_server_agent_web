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
        <el-table-column label="角色名称" width="150">
          <template #default="{ row }">
            {{ row.roleName || `角色${row.roleId}` }}
          </template>
        </el-table-column>
        <el-table-column label="服务器" width="120">
          <template #default="{ row }">
            {{ row.serverName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            {{ row.level || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="战力" width="120">
          <template #default="{ row }">
            {{ row.power ? formatPower(row.power) : '-' }}
          </template>
        </el-table-column>
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
import { getRoleConfigList, saveRoleConfig } from '@/api/modules/roleConfig'
import { getBindList, getGameRole } from '@/api/modules/account'
import { ElMessage } from 'element-plus'
import type { GameRoleConfigEntity, RoleInfo } from '@/types/api'

const router = useRouter()
const configs = ref<GameRoleConfigEntity[]>([])
const loading = ref(false)

// 角色信息映射表：roleId -> RoleInfo
const roleInfoMap = ref<Map<number, RoleInfo>>(new Map())

onMounted(async () => {
  await loadConfigs()
})

async function loadConfigs() {
  loading.value = true
  try {
    // 1. 先获取绑定列表
    const bindRes = await getBindList({})
    const bindList = bindRes.data?.bindInfo || []

    // 2. 获取所有绑定账号下的角色信息
    const roleMap = new Map<number, RoleInfo>()
    for (const bind of bindList) {
      try {
        const roleRes = await getGameRole({ bindId: bind.bindId })
        const roles = roleRes.data?.roleInfos || []
        for (const role of roles) {
          roleMap.set(role.roleId, role)
        }
      } catch (e) {
        // 某个绑定获取失败不影响其他
        console.warn(`获取绑定 ${bind.bindId} 的角色失败`, e)
      }
    }
    roleInfoMap.value = roleMap

    // 3. 获取角色配置列表
    const res = await getRoleConfigList({})
    if (res.data?.data) {
      // 4. 合并角色信息到配置数据
      configs.value = res.data.data.map(config => {
        const roleInfo = roleMap.get(config.roleId)
        return {
          ...config,
          roleName: roleInfo?.roleName || config.roleName,
          serverName: roleInfo?.serverName || config.serverName,
          level: roleInfo?.level || config.level,
          power: roleInfo?.power || config.power
        }
      })
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
