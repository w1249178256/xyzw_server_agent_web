<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">符咒抢购</h2>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        创建抢购任务
      </el-button>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="mb-20"
    >
      <template #title>
        符咒抢购任务会在指定时间自动执行，抢购指定数量的符咒。建议设置在每日刷新后几秒钟执行。
      </template>
    </el-alert>

    <!-- 任务列表 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>抢购任务列表</span>
          <el-button size="small" @click="refreshTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-empty v-if="charmTasks.length === 0" description="暂无符咒抢购任务">
        <el-button type="primary" @click="showCreateDialog">创建第一个任务</el-button>
      </el-empty>

      <el-table v-else :data="charmTasks" style="width: 100%">
        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <div class="role-cell">
              <span class="role-name">{{ getRoleName(row.roleId) }}</span>
              <span class="role-server">{{ getRoleServer(row.roleId) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="taskName" label="任务名称" min-width="140" />

        <el-table-column label="符咒配置" min-width="160">
          <template #default="{ row }">
            <div class="charm-config">
              <span class="charm-name">{{ getCharmName(row) }}</span>
              <span class="charm-num">数量: {{ getCharmNum(row) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="执行时间" width="150">
          <template #default="{ row }">
            <span class="cron-text">{{ formatCron(row.cronExpression) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="执行统计" width="140">
          <template #default="{ row }">
            <div class="stats-cell">
              <span>成功: <span class="success-num">{{ row.successCount }}</span></span>
              <span>失败: <span class="fail-num">{{ row.failCount }}</span></span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="下次执行" width="170">
          <template #default="{ row }">
            {{ formatTime(row.nextExecuteTime) }}
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

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建符咒抢购任务"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="选择角色" prop="roleId">
          <el-select
            v-model="formData.roleId"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="`${role.roleName} (${role.serverName})`"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="formData.taskName" placeholder="例如: 每日抢购灵符" />
        </el-form-item>

        <el-form-item label="符咒类型" prop="charmId">
          <el-select v-model="formData.charmId" placeholder="请选择符咒" style="width: 100%">
            <el-option
              v-for="charm in charmOptions"
              :key="charm.id"
              :label="charm.name"
              :value="charm.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="购买数量" prop="buyNum">
          <el-input-number
            v-model="formData.buyNum"
            :min="1"
            :max="99"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="执行时间" prop="executeTime">
          <el-time-picker
            v-model="formData.executeTime"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            placeholder="选择执行时间"
            style="width: 100%"
          />
          <div class="form-tip">
            建议设置在每日刷新后（如 00:00:05）执行以提高抢购成功率
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { getTaskList, toggleTask, deleteTask, createCharmBuyTask } from '@/api/modules/task'
import { getBindList, getGameRole } from '@/api/modules/account'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { GameTaskEntity, RoleInfo } from '@/types/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

// 所有任务
const allTasks = ref<GameTaskEntity[]>([])

// 角色信息
const roleList = ref<RoleInfo[]>([])
const roleInfoMap = ref<Map<number, RoleInfo>>(new Map())

// 符咒选项（根据游戏实际情况配置）
const charmOptions = [
  { id: 1, name: '灵符' },
  { id: 2, name: '神符' },
  { id: 3, name: '天符' },
  { id: 4, name: '圣符' },
  { id: 5, name: '仙符' }
]

// 表单数据
const formData = reactive({
  roleId: undefined as number | undefined,
  taskName: '',
  charmId: undefined as number | undefined,
  buyNum: 1,
  executeTime: '00:00:05'
})

// 表单验证规则
const formRules: FormRules = {
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  charmId: [{ required: true, message: '请选择符咒类型', trigger: 'change' }],
  buyNum: [{ required: true, message: '请输入购买数量', trigger: 'blur' }],
  executeTime: [{ required: true, message: '请选择执行时间', trigger: 'change' }]
}

// 筛选符咒抢购任务
const charmTasks = computed(() => {
  return allTasks.value.filter(t => t.taskType === 'CHARM_BUY')
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

    const roles: RoleInfo[] = []
    const roleMap = new Map<number, RoleInfo>()

    for (const bind of bindList) {
      try {
        const roleRes = await getGameRole({ bindId: bind.bindId })
        const roleInfos = roleRes.data?.roleInfos || []
        for (const role of roleInfos) {
          roles.push(role)
          roleMap.set(role.roleId, role)
        }
      } catch (e) {
        console.warn(`获取绑定 ${bind.bindId} 的角色失败`, e)
      }
    }

    roleList.value = roles
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
      allTasks.value = res.data
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

// 显示创建对话框
function showCreateDialog() {
  // 重置表单
  formData.roleId = undefined
  formData.taskName = ''
  formData.charmId = undefined
  formData.buyNum = 1
  formData.executeTime = '00:00:05'
  dialogVisible.value = true
}

// 创建任务
async function handleCreate() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 将时间转换为 cron 表达式
      const [hour, minute, second] = formData.executeTime.split(':')
      const cronExpression = `${second} ${minute} ${hour} * * ?`

      const res = await createCharmBuyTask({
        roleId: formData.roleId!,
        taskName: formData.taskName,
        charmId: formData.charmId!,
        buyNum: formData.buyNum,
        cronExpression
      })

      if (res.code === 0 || res.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        await loadTasks()
      } else {
        ElMessage.error(res.msg || '创建失败')
      }
    } catch (error) {
      ElMessage.error('创建失败')
    } finally {
      submitting.value = false
    }
  })
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

// 解析任务配置
function parseTaskConfig(task: GameTaskEntity): Record<string, any> {
  const config = task.taskConfig
  if (!config) return {}
  if (typeof config === 'string') {
    try {
      return JSON.parse(config)
    } catch {
      return {}
    }
  }
  return config as Record<string, any>
}

// 获取符咒名称
function getCharmName(task: GameTaskEntity): string {
  const config = parseTaskConfig(task)
  const charmId = config.charmId
  const charm = charmOptions.find(c => c.id === charmId)
  return charm?.name || `符咒${charmId || '未知'}`
}

// 获取购买数量
function getCharmNum(task: GameTaskEntity): number {
  const config = parseTaskConfig(task)
  return config.buyNum || 0
}

// 格式化 cron 表达式为可读时间
function formatCron(cron: string): string {
  if (!cron) return '-'
  // 简单解析 cron: 秒 分 时 日 月 周
  const parts = cron.split(' ')
  if (parts.length >= 3) {
    const second = parts[0].padStart(2, '0')
    const minute = parts[1].padStart(2, '0')
    const hour = parts[2].padStart(2, '0')
    return `每天 ${hour}:${minute}:${second}`
  }
  return cron
}

// 格式化时间
function formatTime(time?: string): string {
  if (!time) return '-'
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
    await ElMessageBox.confirm('确定要删除此抢购任务吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const res = await deleteTask(taskId)
    if (res.code === 0 || res.code === 200) {
      allTasks.value = allTasks.value.filter(t => t.id !== taskId)
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
.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-cell {
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

.charm-config {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.charm-name {
  font-weight: 500;
  color: #e6a23c;
}

.charm-num {
  font-size: 12px;
  color: #606266;
}

.cron-text {
  font-size: 13px;
  color: #409eff;
}

.stats-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.success-num {
  color: #67c23a;
  font-weight: 500;
}

.fail-num {
  color: #f56c6c;
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
