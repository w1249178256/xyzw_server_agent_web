<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">任务监控</h2>
      <div>
        <el-button type="success" @click="executeAll">
          <el-icon><VideoPlay /></el-icon>
          执行所有任务
        </el-button>
        <el-button @click="refreshStatus">
          <el-icon><Refresh /></el-icon>
          刷新状态
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统健康状态</span>
              <el-tag :type="healthType">{{ healthText }}</el-tag>
            </div>
          </template>
          <div v-if="taskStore.healthStatus">
            <p><strong>服务:</strong> {{ taskStore.healthStatus.service }}</p>
            <p><strong>状态:</strong> {{ taskStore.healthStatus.status }}</p>
            <p><strong>时间戳:</strong> {{ new Date(taskStore.healthStatus.timestamp).toLocaleString() }}</p>
          </div>
          <div v-else class="text-muted">暂无数据</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>调度器状态</span>
              <el-tag :type="schedulerType">{{ schedulerText }}</el-tag>
            </div>
          </template>
          <div v-if="taskStore.schedulerStatus">
            <p><strong>运行状态:</strong> {{ taskStore.schedulerStatus.status ? '运行中' : '已停止' }}</p>
            <p><strong>任务数:</strong> {{ Object.keys(taskStore.schedulerStatus.task || {}).length }}</p>
          </div>
          <div v-else class="text-muted">暂无数据</div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>调度器配置</span>
          </template>
          <div v-if="taskStore.schedulerConfig">
            <p><strong>Cron:</strong> {{ taskStore.schedulerConfig.scheduleCron }}</p>
            <p><strong>描述:</strong> {{ taskStore.schedulerConfig.scheduleDescription }}</p>
            <p><strong>并发线程:</strong> {{ taskStore.schedulerConfig.concurrentThreads }}</p>
            <p><strong>自动执行:</strong> {{ taskStore.schedulerConfig.autoExecute ? '是' : '否' }}</p>
          </div>
          <div v-else class="text-muted">暂无数据</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <span>任务执行统计</span>
      </template>
      <el-table :data="taskStore.taskList" style="width: 100%">
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column prop="taskType" label="任务类型" width="150" />
        <el-table-column label="执行次数" width="100">
          <template #default="{ row }">
            {{ row.executeCount }}
          </template>
        </el-table-column>
        <el-table-column label="成功次数" width="100">
          <template #default="{ row }">
            <span style="color: #67c23a">{{ row.successCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="失败次数" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c">{{ row.failCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成功率" width="100">
          <template #default="{ row }">
            {{ calculateSuccessRate(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastExecuteTime" label="最后执行时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { ElMessage } from 'element-plus'
import { VideoPlay, Refresh } from '@element-plus/icons-vue'

const taskStore = useTaskStore()

const healthType = computed(() => {
  return taskStore.healthStatus?.status === 'ok' ? 'success' : 'danger'
})

const healthText = computed(() => {
  return taskStore.healthStatus?.status === 'ok' ? '正常' : '异常'
})

const schedulerType = computed(() => {
  return taskStore.schedulerStatus?.status ? 'success' : 'info'
})

const schedulerText = computed(() => {
  return taskStore.schedulerStatus?.status ? '运行中' : '已停止'
})

onMounted(async () => {
  await refreshStatus()
})

async function refreshStatus() {
  await Promise.all([
    taskStore.fetchHealthStatus(),
    taskStore.fetchSchedulerStatus(),
    taskStore.fetchSchedulerConfig(),
    taskStore.fetchTasks()
  ])
}

async function executeAll() {
  const success = await taskStore.executeAll()
  if (success) {
    ElMessage.success('任务执行中')
  } else {
    ElMessage.error('执行失败')
  }
}

function calculateSuccessRate(row: any) {
  if (row.executeCount === 0) return '0%'
  return ((row.successCount / row.executeCount) * 100).toFixed(1) + '%'
}
</script>
