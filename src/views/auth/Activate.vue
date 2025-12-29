<template>
  <div class="activate-container">
    <div class="activate-card">
      <div class="activate-header">
        <el-icon :size="48" color="#409eff"><Key /></el-icon>
        <h2>平台激活</h2>
        <p class="subtitle">请导入 License 文件以激活平台服务</p>
      </div>

      <!-- 服务信息（始终显示 serviceId 和 machineId） -->
      <div v-if="licenseStore.licenseStatus" class="service-info top">
        <div class="info-item" v-if="licenseStore.licenseStatus.serviceId">
          <span class="label">服务ID：</span>
          <span class="value copyable" @click="copyToClipboard(licenseStore.licenseStatus.serviceId)">
            {{ licenseStore.licenseStatus.serviceId }}
            <el-icon class="copy-icon"><DocumentCopy /></el-icon>
          </span>
        </div>
        <div class="info-item" v-if="licenseStore.licenseStatus.machineId">
          <span class="label">机器ID：</span>
          <span class="value copyable" @click="copyToClipboard(licenseStore.licenseStatus.machineId)">
            {{ licenseStore.licenseStatus.machineId }}
            <el-icon class="copy-icon"><DocumentCopy /></el-icon>
          </span>
        </div>
        <p class="hint">请将以上信息提供给管理员以获取 License 文件</p>
      </div>

      <!-- 服务状态信息 -->
      <div v-if="licenseStore.licenseStatus" class="status-info">
        <el-alert
          v-if="!licenseStore.isValid"
          title="服务未激活"
          type="warning"
          :description="licenseStore.licenseStatus.message || '请导入有效的 License 文件进行激活'"
          :closable="false"
          show-icon
        />
        <el-alert
          v-else-if="licenseStore.remainingDays && licenseStore.remainingDays <= 7"
          title="License 即将过期"
          type="warning"
          :description="`剩余 ${licenseStore.remainingDays} 天，请及时续期`"
          :closable="false"
          show-icon
        />
        <el-alert
          v-else-if="licenseStore.isValid"
          title="服务已激活"
          type="success"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 激活表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleActivate"
      >
        <!-- 文件导入（主要方式） -->
        <el-form-item>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".lic,.license,.txt,.key"
            :on-change="handleFileChange"
            drag
            class="license-upload"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              拖拽 License 文件到此处，或 <em>点击选择文件</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 .lic, .license, .txt, .key 格式
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 显示已选择的文件名 -->
        <div v-if="selectedFileName" class="selected-file">
          <el-tag closable @close="clearFile">{{ selectedFileName }}</el-tag>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            :disabled="!form.licenseData"
            @click="handleActivate"
          >
            {{ loading ? '激活中...' : '激活' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部链接 -->
      <div class="activate-footer">
        <el-button link type="primary" @click="refreshStatus">
          <el-icon class="el-icon--left"><Refresh /></el-icon>
          刷新状态
        </el-button>
        <el-divider direction="vertical" />
        <el-button link @click="goToLogin">
          返回登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules, UploadFile } from 'element-plus'
import { Key, Upload, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { useLicenseStore } from '@/stores/license'

const router = useRouter()
const licenseStore = useLicenseStore()

const formRef = ref<FormInstance>()
const uploadRef = ref()
const loading = ref(false)
const selectedFileName = ref('')

const form = reactive({
  licenseData: ''  // base64编码的license内容
})

const rules: FormRules = {
  licenseData: [
    { required: true, message: '请导入 License 文件', trigger: 'change' }
  ]
}

// 激活
async function handleActivate() {
  if (!form.licenseData) {
    ElMessage.warning('请先导入 License 文件')
    return
  }

  loading.value = true
  try {
    const result = await licenseStore.activate(form.licenseData)

    if (result.success) {
      ElMessage.success('激活成功')
      // 跳转到登录页
      if (licenseStore.isValid) {
        router.push('/login')
      }
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.value = false
  }
}

// 从文件导入（读取为base64）
function handleFileChange(file: UploadFile) {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (result) {
      // readAsDataURL 返回格式为 "data:xxx;base64,xxxxx"
      // 需要提取 base64 部分
      const base64 = result.split(',')[1] || result
      form.licenseData = base64
      selectedFileName.value = file.name
      ElMessage.success('文件导入成功')
    }
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsDataURL(file.raw)
}

// 清除已选择的文件
function clearFile() {
  form.licenseData = ''
  selectedFileName.value = ''
}

// 刷新状态
async function refreshStatus() {
  loading.value = true
  try {
    await licenseStore.checkLicenseStatus()

    if (licenseStore.isValid) {
      ElMessage.success('服务状态正常')
    } else {
      ElMessage.warning(licenseStore.licenseStatus?.message || '服务未激活')
    }
  } finally {
    loading.value = false
  }
}

// 返回登录
function goToLogin() {
  router.push('/login')
}

// 复制到剪贴板
async function copyToClipboard(text: string | undefined) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

onMounted(async () => {
  // 初始化时检查状态
  await licenseStore.checkLicenseStatus()

  // 如果已经激活，提示并可跳转
  if (licenseStore.isValid) {
    ElMessage.info('服务已激活，可以正常使用')
  }
})
</script>

<style scoped>
.activate-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.activate-card {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.activate-header {
  text-align: center;
  margin-bottom: 24px;
}

.activate-header h2 {
  margin: 16px 0 8px;
  font-size: 24px;
  color: #303133;
}

.activate-header .subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.service-info.top {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.service-info.top .hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.status-info {
  margin-bottom: 20px;
}

.activate-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
  min-width: 70px;
  flex-shrink: 0;
}

.info-item .value {
  color: #606266;
  word-break: break-all;
}

.info-item .value.copyable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
  background: #fff;
}

.info-item .value.copyable:hover {
  background-color: #ecf5ff;
}

.info-item .copy-icon {
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.info-item .value.copyable:hover .copy-icon {
  color: #409eff;
}

.license-upload {
  width: 100%;
}

.license-upload :deep(.el-upload-dragger) {
  width: 100%;
  padding: 30px 20px;
}

.selected-file {
  margin-bottom: 16px;
  text-align: center;
}
</style>
