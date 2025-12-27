<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">创建任务</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-card style="max-width: 700px">
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskRules"
        label-width="120px"
      >
        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="taskForm.taskType" placeholder="请选择任务类型">
            <el-option label="购买魅力" value="CHARM_BUY" />
            <el-option label="战役续费挂机" value="BATTLE_RENEWAL" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model.number="taskForm.roleId" placeholder="请输入角色ID" />
        </el-form-item>

        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="taskForm.taskName" placeholder="请输入任务名称" />
        </el-form-item>

        <template v-if="taskForm.taskType === 'CHARM_BUY'">
          <el-form-item label="魅力ID" prop="charmId">
            <el-input v-model.number="taskForm.charmId" placeholder="请输入魅力ID" />
          </el-form-item>
          <el-form-item label="购买数量" prop="buyNum">
            <el-input v-model.number="taskForm.buyNum" placeholder="请输入购买数量" />
          </el-form-item>
        </template>

        <el-form-item label="Cron表达式" prop="cronExpression">
          <el-input v-model="taskForm.cronExpression" placeholder="例如: 0 0 8 * * ?" />
          <div class="form-tip">常用: 每天8点 = 0 0 8 * * ?</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCreate" :loading="loading">
            创建任务
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const taskStore = useTaskStore()

const taskFormRef = ref<FormInstance>()
const loading = ref(false)

const taskForm = reactive({
  taskType: '',
  roleId: 0,
  taskName: '',
  charmId: 0,
  buyNum: 1,
  cronExpression: '0 0 8 * * ?'
})

const taskRules: FormRules = {
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  roleId: [{ required: true, message: '请输入角色ID', trigger: 'blur' }],
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
}

async function handleCreate() {
  if (!taskFormRef.value) return

  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let success = false
        if (taskForm.taskType === 'CHARM_BUY') {
          success = await taskStore.createCharmTask({
            roleId: taskForm.roleId,
            taskName: taskForm.taskName,
            charmId: taskForm.charmId,
            buyNum: taskForm.buyNum,
            cronExpression: taskForm.cronExpression
          })
        } else if (taskForm.taskType === 'BATTLE_RENEWAL') {
          success = await taskStore.createBattleTask({
            roleId: taskForm.roleId
          })
        }

        if (success) {
          ElMessage.success('创建成功')
          router.push('/tasks')
        } else {
          ElMessage.error('创建失败')
        }
      } catch (error) {
        ElMessage.error('创建失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
