<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">绑定游戏账号</h2>
    </div>

    <el-card style="max-width: 900px; margin: 0 auto">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 40px">
        <el-step title="验证身份" />
        <el-step title="选择角色" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1: 验证身份 -->
      <div v-if="currentStep === 0">
        <el-alert
          title="绑定说明"
          type="info"
          description="请使用游戏账号绑定的手机号进行验证，验证成功后将自动创建绑定记录"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        <div v-loading="loading">
          <el-form
            ref="phoneFormRef"
            :model="phoneForm"
            :rules="phoneRules"
            label-width="100px"
            style="max-width: 500px; margin: 0 auto"
          >
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="phoneForm.phone"
                placeholder="请输入手机号"
                size="large"
                maxlength="11"
                clearable
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="验证码" prop="smsCode">
              <el-input
                v-model="phoneForm.smsCode"
                placeholder="请输入6位验证码"
                size="large"
                maxlength="6"
                clearable
                style="width: calc(100% - 130px); margin-right: 10px"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
              <el-button
                size="large"
                style="width: 120px"
                :disabled="countdown > 0 || !phoneForm.phone"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
              </el-button>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :disabled="!phoneForm.phone || !phoneForm.smsCode"
                @click="handleBind"
              >
                验证并绑定
              </el-button>
              <el-button size="large" style="width: 100%; margin-top: 10px" @click="$router.back()">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 步骤2: 选择角色 -->
      <div v-if="currentStep === 1" v-loading="loading" :element-loading-text="loadingText">
        <div v-if="availableRoles.length > 0">
          <el-alert
            title="请选择要绑定的角色"
            type="success"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              找到 <strong>{{ availableRoles.length }}</strong> 个可用角色，请勾选您要绑定到平台的角色
            </template>
          </el-alert>

          <!-- 批量操作栏 -->
          <div class="batch-actions">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span class="selection-info">
              已选择 <strong>{{ selectedRoles.length }}</strong> / {{ availableRoles.length }} 个角色
            </span>
            <el-button
              type="primary"
              :disabled="selectedRoles.length === 0"
              @click="handleBatchBind"
            >
              批量绑定 ({{ selectedRoles.length }})
            </el-button>
          </div>

          <!-- 角色列表 -->
          <el-table
            ref="rolesTableRef"
            :data="availableRoles"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="角色名称" width="180" />
            <el-table-column prop="serverName" label="服务器" width="150" />
            <el-table-column prop="level" label="等级" width="100" />
            <el-table-column label="战力" width="150">
              <template #default="{ row }">
                {{ row.power ? formatPower(row.power) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="roleId" label="角色ID" width="120" />
            <el-table-column label="最后登录" min-width="180">
              <template #default="{ row }">
                {{ row.loginAt || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-empty v-else description="未找到可用角色，请检查游戏账号" />
      </div>

      <!-- 步骤3: 完成 -->
      <div v-if="currentStep === 2">
        <div style="text-align: center; padding: 20px 0">
          <el-icon style="font-size: 64px; color: #67c23a"><SuccessFilled /></el-icon>
          <h2 style="margin: 20px 0 10px">绑定完成</h2>
          <p style="color: #909399; margin-bottom: 10px">
            总计: <strong style="color: #409eff">{{ bindResult.total }}</strong> 个角色
          </p>
          <p style="color: #67c23a; margin-bottom: 10px">
            成功: <strong>{{ bindResult.success }}</strong> 个
          </p>
          <p v-if="bindResult.skipped > 0" style="color: #e6a23c; margin-bottom: 10px">
            跳过: <strong>{{ bindResult.skipped }}</strong> 个（已存在）
          </p>
          <p v-if="bindResult.failed > 0" style="color: #f56c6c; margin-bottom: 30px">
            失败: <strong>{{ bindResult.failed }}</strong> 个
          </p>
        </div>

        <!-- 失败详情 -->
        <div v-if="bindResult.details?.failedRoles?.length > 0" style="margin-bottom: 30px">
          <el-alert
            title="部分角色绑定失败"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              <div v-for="item in bindResult.details.failedRoles" :key="item.roleId">
                角色ID {{ item.roleId }}: {{ item.reason }}
              </div>
            </template>
          </el-alert>
        </div>

        <!-- 已绑定角色列表 -->
        <div v-if="boundRoles.length > 0" style="margin-bottom: 30px">
          <h3 style="margin-bottom: 15px">已绑定的角色</h3>
          <el-table :data="boundRoles" stripe style="width: 100%">
            <el-table-column prop="roleName" label="角色名称" width="180" />
            <el-table-column prop="serverName" label="服务器" width="150" />
            <el-table-column label="等级" width="100">
              <template #default="{ row }">
                {{ row.level || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="战力" width="150">
              <template #default="{ row }">
                {{ row.power ? formatPower(row.power) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default>
                <el-tag type="success" size="small">已绑定</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="text-align: center">
          <el-button type="primary" size="large" @click="goToDashboard">
            前往控制台
          </el-button>
          <el-button size="large" @click="$router.back()">
            返回列表
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Phone, Lock, SuccessFilled } from '@element-plus/icons-vue'
import type { Role } from '@/types/api'

const router = useRouter()
const accountStore = useAccountStore()

// 表单引用
const phoneFormRef = ref<FormInstance>()
const rolesTableRef = ref()

// 状态管理
const currentStep = ref(0)
const loading = ref(false)
const loadingText = ref('')
const countdown = ref(0)
const currentBindId = ref<number | null>(null)

// 角色数据
const availableRoles = ref<Role[]>([])
const selectedRoles = ref<Role[]>([])
const boundRoles = ref<any[]>([])

// 绑定结果
const bindResult = ref({
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  details: null as any
})

// 表单数据
const phoneForm = reactive({
  phone: '',
  smsCode: ''
})

// 全选状态
const selectAll = ref(false)
const isIndeterminate = computed(() => {
  const selected = selectedRoles.value.length
  const total = availableRoles.value.length
  return selected > 0 && selected < total
})

// 表单验证规则
const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  smsCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      pattern: /^\d{6}$/,
      message: '请输入6位数字验证码',
      trigger: 'blur'
    }
  ]
}

// 发送验证码
async function handleSendCode() {
  // 前端校验手机号
  if (!/^1\d{10}$/.test(phoneForm.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }

  loading.value = true

  try {
    const result = await accountStore.sendBindCode({
      phone: phoneForm.phone
    })

    if (result.success) {
      ElMessage.success('验证码已发送，请查看短信')
      startCountdown()
    } else {
      ElMessage.error(result.message || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 倒计时
function startCountdown() {
  let time = 60
  countdown.value = time

  const timer = setInterval(() => {
    time--
    countdown.value = time

    if (time <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 验证并绑定
async function handleBind() {
  if (!phoneFormRef.value) return

  await phoneFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      loadingText.value = '正在验证并绑定...'

      try {
        const result = await accountStore.bindWithCode({
          phone: phoneForm.phone,
          smsCode: phoneForm.smsCode
        })

        if (result.success) {
          ElMessage.success('绑定成功')

          // 获取最新的 bindId
          currentBindId.value = accountStore.getLatestBindId()

          if (currentBindId.value) {
            // 加载可用角色
            await loadAvailableRoles()
          } else {
            ElMessage.error('获取绑定信息失败，请返回重试')
          }
        } else {
          ElMessage.error(result.message || '验证码错误，请重新输入')
        }
      } catch (error) {
        ElMessage.error('绑定失败，请稍后重试')
      } finally {
        loading.value = false
        loadingText.value = ''
      }
    }
  })
}

// 加载可用角色
async function loadAvailableRoles() {
  if (!currentBindId.value) {
    ElMessage.error('绑定信息丢失，请返回重新绑定')
    return
  }

  loading.value = true
  loadingText.value = '正在加载可用角色...'

  try {
    const roles = await accountStore.fetchAvailableRoles(currentBindId.value)
    availableRoles.value = roles

    if (roles.length > 0) {
      // 进入选择角色步骤
      currentStep.value = 1
      ElMessage.success(`找到 ${roles.length} 个可用角色`)
    } else {
      ElMessage.warning('未找到可用角色，请检查游戏账号')
    }
  } catch (error) {
    ElMessage.error('加载角色失败，请重试')
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}

// 处理选择变化
function handleSelectionChange(selection: Role[]) {
  selectedRoles.value = selection
  selectAll.value = selection.length === availableRoles.value.length
}

// 全选/取消全选
function handleSelectAll(val: boolean) {
  if (val) {
    rolesTableRef.value?.toggleAllSelection()
  } else {
    rolesTableRef.value?.clearSelection()
  }
}

// 批量绑定角色
async function handleBatchBind() {
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

    loading.value = true
    loadingText.value = '正在批量绑定角色...'

    const roleSelections = selectedRoles.value.map(role => ({
      gameRoleId: role.roleId,
      serverId: role.serverId
    }))
    const result = await accountStore.batchBindRoles({
      bindId: currentBindId.value!,
      roleSelections
    })

    if (result) {
      // 保存绑定结果
      bindResult.value = {
        total: result.totalCount,
        success: result.successCount,
        failed: result.failedCount,
        skipped: 0,
        details: null
      }

      // 获取已绑定的角色列表
      const roles = await accountStore.fetchRoles(currentBindId.value!)
      boundRoles.value = roles

      // 显示结果
      if (result.failedCount === 0) {
        ElMessage.success(`成功绑定 ${result.successCount} 个角色`)
      } else {
        ElMessage.warning(`绑定完成，成功 ${result.successCount} 个，失败 ${result.failedCount} 个`)
      }

      // 进入完成步骤
      currentStep.value = 2
    } else {
      ElMessage.error('批量绑定失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch bind error:', error)
      ElMessage.error('批量绑定失败，请重试')
    }
  } finally {
    loading.value = false
    loadingText.value = ''
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

// 前往控制台
function goToDashboard() {
  router.push('/accounts')
}

</script>

<style scoped>
.el-steps {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.el-step__title) {
  font-size: 14px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selection-info {
  flex: 1;
  color: #606266;
  font-size: 14px;
}

.selection-info strong {
  color: #409eff;
  font-size: 16px;
}
</style>
