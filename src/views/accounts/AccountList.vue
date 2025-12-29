<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">游戏账号列表</h2>
      <el-button type="primary" @click="$router.push('/accounts/bind')">
        <el-icon><Plus /></el-icon>
        绑定账号
      </el-button>
    </div>

    <el-card v-loading="accountStore.loading">
      <el-table :data="accountStore.bindList" style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="bindId" label="绑定ID" width="100" />
        <el-table-column prop="remark" label="备注" width="150" />
        <el-table-column label="角色信息" min-width="400">
          <template #default="{ row }">
            <div v-if="row.roles && row.roles.length > 0" class="roles-container">
              <el-tag
                v-for="role in row.roles"
                :key="role.roleId"
                class="role-tag"
                type="info"
              >
                {{ role.roleName }}
                <span v-if="role.level" class="role-level"> Lv.{{ role.level }}</span>
                <span v-if="role.power" class="role-power"> ⚔️{{ formatPower(role.power) }}</span>
              </el-tag>
            </div>
            <el-text v-else type="info" size="small">暂无角色，请点击"查看角色"加载</el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewRoles(row.bindId)">
              查看角色
            </el-button>
            <el-button type="success" size="small" @click="syncRoles(row.bindId)">
              同步角色
            </el-button>
            <el-button type="warning" size="small" @click="manageRoles(row.bindId)">
              管理角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看角色对话框 -->
    <el-dialog v-model="rolesDialogVisible" title="角色列表" width="800px">
      <el-table :data="currentRoles" style="width: 100%">
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="serverName" label="服务器" width="120" />
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            {{ row.level || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="power" label="战力" width="120">
          <template #default="{ row }">
            {{ row.power ? row.power.toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="roleId" label="角色ID" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToConfig(row.roleId)">
              配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 管理角色对话框 -->
    <el-dialog
      v-model="manageDialogVisible"
      title="管理游戏角色"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="role-management">
        <!-- 可用角色列表 -->
        <div class="role-section">
          <div class="section-header">
            <h3>游戏账号中的可用角色</h3>
            <el-button
              type="primary"
              size="small"
              @click="loadAvailableRoles"
              :loading="loadingAvailable"
            >
              刷新列表
            </el-button>
          </div>
          <div class="batch-actions">
            <el-button
              type="primary"
              size="small"
              @click="batchBindRoles"
              :disabled="selectedRoles.length === 0"
            >
              批量绑定 ({{ selectedRoles.length }})
            </el-button>
            <span v-if="selectedRoles.length > 0" class="selection-info">
              已选择 {{ selectedRoles.length }} 个角色
            </span>
          </div>
          <el-table
            ref="availableRolesTable"
            :data="availableRolesFiltered"
            style="width: 100%"
            v-loading="loadingAvailable"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" :selectable="checkSelectable" />
            <el-table-column prop="name" label="角色名称" width="150" />
            <el-table-column prop="serverName" label="服务器" width="120" />
            <el-table-column prop="level" label="等级" width="80" />
            <el-table-column prop="power" label="战力" width="120">
              <template #default="{ row }">
                {{ row.power ? formatPower(row.power) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="roleId" label="游戏角色ID" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="isRoleAlreadyBound(row.roleId)" type="info" size="small">
                  已绑定
                </el-tag>
                <el-tag v-else type="success" size="small">
                  可绑定
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-divider />

        <!-- 已绑定角色列表 -->
        <div class="role-section">
          <div class="section-header">
            <h3>已绑定到平台的角色</h3>
          </div>
          <el-table
            :data="currentRoles"
            style="width: 100%"
            v-loading="accountStore.loading"
          >
            <el-table-column prop="roleName" label="角色名称" width="150" />
            <el-table-column prop="serverName" label="服务器" width="120" />
            <el-table-column prop="level" label="等级" width="80">
              <template #default="{ row }">
                {{ row.level || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="power" label="战力" width="120">
              <template #default="{ row }">
                {{ row.power ? formatPower(row.power) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="roleId" label="角色ID" width="100" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="goToConfig(row.roleId)"
                >
                  配置
                </el-button>
                <el-popconfirm
                  title="确定要删除这个角色吗？"
                  @confirm="removeRoleFromUser(row.roleId)"
                >
                  <template #reference>
                    <el-button type="danger" size="small">
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Role } from '@/types/api'

const router = useRouter()
const accountStore = useAccountStore()

const rolesDialogVisible = ref(false)
const manageDialogVisible = ref(false)
const currentRoles = ref<any[]>([])
const currentBindId = ref<number>(0)
const loadingAvailable = ref(false)
const selectedRoles = ref<Role[]>([])
const availableRolesTable = ref()

// 过滤出未绑定的角色用于显示
const availableRolesFiltered = computed(() => {
  return accountStore.availableRoles
})

onMounted(async () => {
  await accountStore.fetchBindList()
  // 自动加载每个绑定账号的角色信息
  for (const bind of accountStore.bindList) {
    await accountStore.fetchRoles(bind.bindId)
  }
})

async function viewRoles(bindId: number) {
  const roles = await accountStore.fetchRoles(bindId)
  currentRoles.value = roles
  rolesDialogVisible.value = true
}

async function syncRoles(bindId: number) {
  const success = await accountStore.syncRoles(bindId)
  if (success) {
    ElMessage.success('同步成功')
  } else {
    ElMessage.error('同步失败')
  }
}

async function manageRoles(bindId: number) {
  currentBindId.value = bindId
  manageDialogVisible.value = true

  // 加载已绑定的角色
  const roles = await accountStore.fetchRoles(bindId)
  currentRoles.value = roles

  // 加载可用角色
  await loadAvailableRoles()
}

async function loadAvailableRoles() {
  loadingAvailable.value = true
  try {
    await accountStore.fetchAvailableRoles(currentBindId.value)
  } finally {
    loadingAvailable.value = false
  }
}

// 检查角色是否已经绑定
function isRoleAlreadyBound(gameRoleId: number): boolean {
  return currentRoles.value.some(role => role.roleId === gameRoleId)
}

// 检查行是否可选（只有未绑定的角色才能选择）
function checkSelectable(row: Role): boolean {
  return !isRoleAlreadyBound(row.roleId)
}

// 处理选择变化
function handleSelectionChange(selection: Role[]) {
  selectedRoles.value = selection
}

// 批量绑定角色
async function batchBindRoles() {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请先选择要绑定的角色')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量绑定 ${selectedRoles.value.length} 个角色吗？`,
      '批量绑定确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const roleIds = selectedRoles.value.map(role => role.roleId)
    const result = await accountStore.batchBindRoles({
      bindId: currentBindId.value,
      roleIds
    })

    if (result) {
      // 显示详细结果
      const messages = [
        `总计: ${result.total} 个角色`,
        `成功: ${result.success} 个`,
        `跳过: ${result.skipped} 个`,
        `失败: ${result.failed} 个`
      ]

      if (result.failed > 0 && result.details.failedRoles.length > 0) {
        messages.push('\n失败原因:')
        result.details.failedRoles.forEach(item => {
          messages.push(`- 角色ID ${item.roleId}: ${item.reason}`)
        })
      }

      ElMessageBox.alert(messages.join('\n'), '批量绑定结果', {
        confirmButtonText: '确定',
        type: result.failed > 0 ? 'warning' : 'success'
      })

      // 清空选择
      selectedRoles.value = []
      availableRolesTable.value?.clearSelection()

      // 刷新角色列表
      const roles = await accountStore.fetchRoles(currentBindId.value)
      currentRoles.value = roles
    } else {
      ElMessage.error('批量绑定失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch bind error:', error)
    }
  }
}

// 从平台删除角色
async function removeRoleFromUser(roleId: number) {
  const success = await accountStore.removeRole(roleId, currentBindId.value)

  if (success) {
    ElMessage.success('删除成功')
    // 刷新已绑定角色列表
    const roles = await accountStore.fetchRoles(currentBindId.value)
    currentRoles.value = roles
  } else {
    ElMessage.error('删除失败')
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

function goToConfig(roleId: number) {
  router.push(`/config/${roleId}`)
  manageDialogVisible.value = false
  rolesDialogVisible.value = false
}
</script>

<style scoped>
.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  padding: 6px 12px;
  font-size: 13px;
  white-space: nowrap;
}

.role-level {
  margin-left: 4px;
  color: #409eff;
  font-weight: 500;
}

.role-power {
  margin-left: 6px;
  color: #f56c6c;
  font-weight: 600;
}

.role-management {
  padding: 10px 0;
}

.role-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selection-info {
  color: #606266;
  font-size: 14px;
}
</style>
