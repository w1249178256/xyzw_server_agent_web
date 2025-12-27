<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">仪表板</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon primary"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accountCount }}</div>
              <div class="stat-label">游戏账号</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon success"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.taskCount }}</div>
              <div class="stat-label">运行任务</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon warning"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingTask }}</div>
              <div class="stat-label">待执行任务</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon danger"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failedTask }}</div>
              <div class="stat-label">失败任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/accounts/bind')">
              <el-icon><Plus /></el-icon>
              绑定游戏账号
            </el-button>
            <el-button type="success" @click="$router.push('/tasks/create')">
              <el-icon><Plus /></el-icon>
              创建新任务
            </el-button>
            <el-button type="info" @click="$router.push('/tasks/monitor')">
              <el-icon><View /></el-icon>
              查看任务监控
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-tag :type="healthStatus === 'ok' ? 'success' : 'danger'">
                {{ healthStatus === 'ok' ? '正常' : '异常' }}
              </el-tag>
            </div>
          </template>
          <div class="system-status">
            <div class="status-item">
              <span>调度器状态:</span>
              <span :class="schedulerStatus ? 'status-active' : 'status-inactive'">
                {{ schedulerStatus ? '运行中' : '已停止' }}
              </span>
            </div>
            <div class="status-item">
              <span>服务状态:</span>
              <span class="status-active">正常</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAccountStore } from '@/stores/account'
import { useTaskStore } from '@/stores/task'
import { User, List, Clock, Warning, Plus, View } from '@element-plus/icons-vue'

const accountStore = useAccountStore()
const taskStore = useTaskStore()

const stats = ref({
  accountCount: 0,
  taskCount: 0,
  pendingTask: 0,
  failedTask: 0
})

const healthStatus = ref('ok')
const schedulerStatus = ref(true)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    await accountStore.fetchBindList()
    stats.value.accountCount = accountStore.bindList.length

    await taskStore.fetchTasks()
    stats.value.taskCount = taskStore.taskList.filter(t => t.status === 1).length
    stats.value.pendingTask = taskStore.taskList.filter(t => t.status === 0).length
    stats.value.failedTask = taskStore.taskList.filter(t => t.status === 4).length

    await taskStore.fetchHealthStatus()
    console.log('Health status from API:', taskStore.healthStatus)
    // 后端可能返回 "ok", "healthy", "up" 等值，都认为是正常
    const status = taskStore.healthStatus?.status?.toLowerCase() || ''
    healthStatus.value = ['ok', 'healthy', 'up', 'running'].includes(status) ? 'ok' : 'error'

    await taskStore.fetchSchedulerStatus()
    console.log('Scheduler status from API:', taskStore.schedulerStatus)
    schedulerStatus.value = taskStore.schedulerStatus?.status || false
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}
</script>

<style scoped>
.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-icon.primary {
  color: #409eff;
}

.stat-icon.success {
  color: #67c23a;
}

.stat-icon.warning {
  color: #e6a23c;
}

.stat-icon.danger {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.status-active {
  color: #67c23a;
  font-weight: 600;
}

.status-inactive {
  color: #909399;
  font-weight: 600;
}
</style>
