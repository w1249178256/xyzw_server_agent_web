<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">任务列表</h2>
      <div class="header-actions">
        <el-select
          v-model="filterType"
          placeholder="任务类型"
          clearable
          style="width: 150px; margin-right: 12px"
          @change="handleFilterChange"
        >
          <el-option label="全部类型" value="" />
          <el-option label="符咒抢购" value="CHARM_BUY" />
          <el-option label="挂机续费" value="BATTLE_RENEWAL_HANGUP" />
          <el-option label="每日任务" value="DAILY_TASK" />
        </el-select>
        <el-button @click="refreshTasks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-empty v-if="filteredTasks.length === 0" description="暂无任务" />

      <el-table v-else :data="filteredTasks" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="task-detail">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="任务配置">
                  {{ formatTaskConfig(row.taskConfig) }}
                </el-descriptions-item>
                <el-descriptions-item label="Cron表达式">
                  {{ row.cronExpression || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="执行模式">
                  {{ row.executionMode || '定时执行' }}
                </el-descriptions-item>
                <el-descriptions-item label="执行时间">
                  {{ row.executeTime || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="上次执行">
                  {{ formatTime(row.lastExecuteTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="下次执行">
                  {{ formatTime(row.nextExecuteTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="重试策略">
                  {{ row.retryStrategy || '-' }} (最大{{ row.maxRetryCount }}次)
                </el-descriptions-item>
                <el-descriptions-item label="最后错误">
                  <span class="error-text">{{ row.lastErrorMessage || '无' }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <div class="role-info">
              <span class="role-name">{{ getRoleName(row.roleId) }}</span>
              <span class="role-server">{{ getRoleServer(row.roleId) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="taskName" label="任务名称" min-width="150" />

        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeTag(row.taskType)" size="small">
              {{ getTaskTypeText(row.taskType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="执行统计" width="160">
          <template #default="{ row }">
            <div class="stats-info">
              <span>总: {{ row.executeCount }}</span>
              <span class="success-count">成功: {{ row.successCount }}</span>
              <span class="fail-count">失败: {{ row.failCount }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTaskList, toggleTask, deleteTask } from '@/api/modules/task'
import { getBindList, getGameRole } from '@/api/modules/account'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { GameTaskEntity, RoleInfo } from '@/types/api'

const loading = ref(false)
const tasks = ref<GameTaskEntity[]>([])
const filterType = ref('')

// 角色信息映射
const roleInfoMap = ref<Map<number, RoleInfo>>(new Map())

// 筛选后的任务列表
const filteredTasks = computed(() => {
  if (!filterType.value) {
    return tasks.value
  }
  return tasks.value.filter(t => t.taskType === filterType.value)
})

onMounted(async () => {
  await Promise.all([
    loadRoleInfo(),
    loadTasks()
  ])
})

// 加载角色信息
async function loadRoleInfo() {
  try {
    const bindRes = await getBindList({})
    const bindList = bindRes.data?.bindInfo || []

    const roleMap = new Map<number, RoleInfo>()
    for (const bind of bindList) {
      try {
        const roleRes = await getGameRole({ bindId: bind.bindId })
        const roles = roleRes.data?.roleInfos || []
        for (const role of roles) {
          roleMap.set(role.roleId, role)
        }
      } catch (e) {
        console.warn(`获取绑定 ${bind.bindId} 的角色失败`, e)
      }
    }
    roleInfoMap.value = roleMap
  } catch (error) {
    console.warn('加载角色信息失败', error)
  }
}

// 加载任务列表
async function loadTasks() {
  loading.value = true
  try {
    const res = await getTaskList()
    if (res.data) {
      tasks.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

// 刷新任务
async function refreshTasks() {
  await loadTasks()
  ElMessage.success('刷新成功')
}

// 筛选变化
function handleFilterChange() {
  // 筛选由 computed 自动处理
}

// 获取角色名称
function getRoleName(roleId: number): string {
  const role = roleInfoMap.value.get(roleId)
  return role?.roleName || `角色${roleId}`
}

// 获取角色服务器
function getRoleServer(roleId: number): string {
  const role = roleInfoMap.value.get(roleId)
  return role?.serverName || ''
}

// 获取任务类型标签颜色
function getTaskTypeTag(taskType: string) {
  const map: Record<string, string> = {
    'CHARM_BUY': 'warning',
    'BATTLE_RENEWAL_HANGUP': 'success',
    'DAILY_TASK': 'primary',
    'CUSTOM': 'info'
  }
  return map[taskType] || 'info'
}

// 获取任务类型文本
function getTaskTypeText(taskType: string): string {
  const map: Record<string, string> = {
    'CHARM_BUY': '符咒抢购',
    'BATTLE_RENEWAL_HANGUP': '挂机续费',
    'DAILY_TASK': '每日任务',
    'CUSTOM': '自定义'
  }
  return map[taskType] || taskType
}

// 获取状态类型
function getStatusType(status: number) {
  const map: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
function getStatusText(status: number): string {
  const map: Record<number, string> = {
    0: '禁用',
    1: '启用',
    2: '运行中',
    3: '暂停',
    4: '失败'
  }
  return map[status] || '未知'
}

// 格式化任务配置
function formatTaskConfig(config: any): string {
  if (!config) return '-'
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config)
    } catch {
      return config
    }
  }
  return JSON.stringify(config, null, 2)
}

// 格式化时间
function formatTime(time?: string): string {
  if (!time) return '未执行'
  return new Date(time).toLocaleString()
}

// 切换任务状态
async function toggleStatus(task: GameTaskEntity) {
  const newStatus = task.status === 1 ? 0 : 1
  try {
    const res = await toggleTask(task.id!, newStatus === 1)
    if (res.code === 0 || res.code === 200) {
      task.status = newStatus
      ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 删除任务
async function handleDelete(taskId: number) {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？删除后不可恢复', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const res = await deleteTask(taskId)
    if (res.code === 0 || res.code === 200) {
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
}

.task-detail {
  padding: 16px 24px;
  background-color: #fafafa;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-weight: 500;
  color: #303133;
}

.role-server {
  font-size: 12px;
  color: #909399;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.success-count {
  color: #67c23a;
}

.fail-count {
  color: #f56c6c;
}

.error-text {
  color: #f56c6c;
  word-break: break-all;
}
</style>
