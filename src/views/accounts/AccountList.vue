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
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="角色数量" width="120">
          <template #default="{ row }">
            {{ row.roles?.length || 0 }}
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
    <el-dialog v-model="rolesDialogVisible" title="角色列表" width="600px">
      <el-table :data="currentRoles" style="width: 100%">
        <el-table-column prop="roleId" label="角色ID" width="100" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="serverName" label="服务器" />
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
          <el-table
            :data="accountStore.availableRoles"
            style="width: 100%"
            v-loading="loadingAvailable"
          >
            <el-table-column prop="roleId" label="游戏角色ID" width="120" />
            <el-table-column prop="name" label="角色名称" width="150" />
            <el-table-column prop="serverName" label="服务器" width="120" />
            <el-table-column prop="level" label="等级" width="80" />
            <el-table-column prop="power" label="战力" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  type="success"
                  size="small"
                  @click="bindRoleToUser(row)"
                  :disabled="isRoleAlreadyBound(row.roleId)"
                >
                  {{ isRoleAlreadyBound(row.roleId) ? '已绑定' : '绑定' }}
                </el-button>
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
            <el-table-column prop="roleId" label="角色ID" width="100" />
            <el-table-column prop="roleName" label="角色名称" />
            <el-table-column prop="serverName" label="服务器" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Role } from '@/types/api'

const router = useRouter()
const accountStore = useAccountStore()

const rolesDialogVisible = ref(false)
const manageDialogVisible = ref(false)
const currentRoles = ref<any[]>([])
const currentBindId = ref<number>(0)
const loadingAvailable = ref(false)

onMounted(async () => {
  await accountStore.fetchBindList()
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

// 绑定角色到平台用户
async function bindRoleToUser(role: Role) {
  const success = await accountStore.bindRole({
    bindId: currentBindId.value,
    gameRoleId: role.roleId,
    serverId: Number(role.serverId),
    serverName: role.serverName,
    roleName: role.name,
    roleLevel: role.level
  })

  if (success) {
    ElMessage.success(`成功绑定角色: ${role.name}`)
    // 刷新已绑定角色列表
    const roles = await accountStore.fetchRoles(currentBindId.value)
    currentRoles.value = roles
  } else {
    ElMessage.error('绑定失败')
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

function goToConfig(roleId: number) {
  router.push(`/config/${roleId}`)
  manageDialogVisible.value = false
  rolesDialogVisible.value = false
}
</script>

<style scoped>
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
</style>
