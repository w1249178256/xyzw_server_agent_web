import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getTaskList,
  toggleTask,
  deleteTask,
  createCharmBuyTask,
  createBattleRenewalHangupTask,
  executeAllDailyTasks,
  executeRoleDailyTask,
  getSchedulerStatus,
  getSchedulerConfig,
  getDailyTaskHealth
} from '@/api/modules/task'
import type { GameTask } from '@/types/models'
import type { CharmBuyTaskRequest, GameRegetRequest, RoleDailyTaskRequest, SchedulerConfig, TaskResult, HealthStatus } from '@/types/api'

export const useTaskStore = defineStore('task', () => {

  const taskList = ref<GameTask[]>([])
  const schedulerConfig = ref<SchedulerConfig | null>(null)
  const schedulerStatus = ref<TaskResult | null>(null)
  const healthStatus = ref<HealthStatus | null>(null)
  const loading = ref(false)

  async function fetchTasks(roleId?: number) {
    loading.value = true
    try {
      const res = await getTaskList(roleId)
      if (res.data) {
        taskList.value = res.data.map(task => ({
          ...task,
          status: task.status as any,
          taskConfig: typeof task.taskConfig === 'string'
            ? JSON.parse(task.taskConfig)
            : task.taskConfig
        }))
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      loading.value = false
    }
  }

  async function toggleTaskStatus(taskId: number, enabled: boolean) {
    try {
      const res = await toggleTask(taskId, enabled)
      if (res.code === 200) {
        const task = taskList.value.find(t => t.id === taskId)
        if (task) {
          task.status = enabled ? 1 : 0
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to toggle task:', error)
      return false
    }
  }

  async function removeTask(taskId: number) {
    try {
      const res = await deleteTask(taskId)
      if (res.code === 200) {
        taskList.value = taskList.value.filter(t => t.id !== taskId)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete task:', error)
      return false
    }
  }

  async function createCharmTask(data: CharmBuyTaskRequest) {
    try {
      const res = await createCharmBuyTask(data)
      if (res.code === 200 || res.code === 0) {
        await fetchTasks()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create charm task:', error)
      return false
    }
  }

  async function createBattleTask(data: GameRegetRequest) {
    try {
      const res = await createBattleRenewalHangupTask(data)
      if (res.code === 200 || res.code === 0) {
        await fetchTasks()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to create battle task:', error)
      return false
    }
  }

  async function executeAll() {
    try {
      const res = await executeAllDailyTasks()
      return res.code === 200
    } catch (error) {
      console.error('Failed to execute all tasks:', error)
      return false
    }
  }

  async function executeRoleTask(data: RoleDailyTaskRequest) {
    try {
      const res = await executeRoleDailyTask(data)
      return res.code === 200 || res.code === 0
    } catch (error) {
      console.error('Failed to execute role task:', error)
      return false
    }
  }

  async function fetchSchedulerStatus() {
    try {
      const res = await getSchedulerStatus()
      if (res.data) {
        schedulerStatus.value = res.data
      }
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error)
      // 设置默认值
      schedulerStatus.value = {
        status: false,
        task: {}
      }
    }
  }

  async function fetchSchedulerConfig() {
    try {
      const res = await getSchedulerConfig()
      if (res.data) {
        schedulerConfig.value = res.data
      }
    } catch (error) {
      console.error('Failed to fetch scheduler config:', error)
    }
  }

  async function fetchHealthStatus() {
    try {
      const res = await getDailyTaskHealth()
      if (res.data) {
        healthStatus.value = res.data
      }
    } catch (error) {
      console.error('Failed to fetch health status:', error)
      // 设置默认值，避免显示异常
      healthStatus.value = {
        status: 'unknown',
        service: 'daily-task',
        timestamp: Date.now()
      }
    }
  }

  return {
    taskList,
    schedulerConfig,
    schedulerStatus,
    healthStatus,
    loading,
    fetchTasks,
    toggleTaskStatus,
    removeTask,
    createCharmTask,
    createBattleTask,
    executeAll,
    executeRoleTask,
    fetchSchedulerStatus,
    fetchSchedulerConfig,
    fetchHealthStatus
  }
})
