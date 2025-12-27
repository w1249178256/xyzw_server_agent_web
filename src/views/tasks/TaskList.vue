<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">任务列表</h2>
      <el-button type="primary" @click="$router.push('/tasks/create')">
        <el-icon><Plus /></el-icon>
        创建任务
      </el-button>
    </div>

    <el-card v-loading="taskStore.loading">
      <el-table :data="taskStore.taskList" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="task-detail">
              <p><strong>任务配置:</strong> {{ row.taskConfig }}</p>
              <p><strong>Cron表达式:</strong> {{ row.cronExpression }}</p>
              <p><strong>上次执行:</strong> {{ row.lastExecuteTime || '未执行' }}</p>
              <p><strong>下次执行:</strong> {{ row.nextExecuteTime || '未设置' }}</p>
              <p><strong>最后错误:</strong> {{ row.lastErrorMessage || '无' }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="taskName" label="任务名称" width="180" />
        <el-table-column prop="taskType" label="任务类型" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行统计" width="180">
          <template #default="{ row }">
            总:{{ row.executeCount }} | 成功:{{ row.successCount }} | 失败:{{ row.failCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteTask(row.id)"
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
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const taskStore = useTaskStore()

onMounted(async () => {
  await taskStore.fetchTasks()
})

function getStatusType(status: number) {
  const map: Record<number, any> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'danger'
  }
  return map[status] || 'info'
}

function getStatusText(status: number) {
  const map: Record<number, string> = {
    0: '禁用',
    1: '启用',
    2: '运行中',
    3: '暂停',
    4: '失败'
  }
  return map[status] || '未知'
}

async function toggleStatus(task: any) {
  const newStatus = task.status === 1 ? 0 : 1
  const success = await taskStore.toggleTaskStatus(task.id, newStatus === 1)
  if (success) {
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
  } else {
    ElMessage.error('操作失败')
  }
}

async function deleteTask(taskId: number) {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？', '提示', {
      type: 'warning'
    })
    const success = await taskStore.removeTask(taskId)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.task-detail {
  padding: 10px 20px;
}

.task-detail p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}
</style>
