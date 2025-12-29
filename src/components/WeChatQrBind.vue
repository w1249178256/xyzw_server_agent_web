<template>
  <div class="wechat-qr-bind">
    <!-- 步骤 1：显示二维码 -->
    <div v-if="step === 'scanning'" class="qr-container">
      <div class="qr-header">
        <el-icon :size="24" color="#07c160"><ChatLineSquare /></el-icon>
        <span>微信扫码绑定</span>
      </div>

      <div class="qr-content">
        <!-- 使用 iframe 加载微信授权页面 -->
        <div class="qr-frame-wrapper">
          <iframe
            ref="wxIframe"
            :src="wxOAuthUrl"
            class="wx-iframe"
            sandbox="allow-scripts allow-same-origin allow-top-navigation"
            @load="onIframeLoad"
          />
          <div v-if="loading" class="qr-loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>正在加载...</span>
          </div>
        </div>

        <div class="qr-tips">
          <p>请使用微信扫描二维码</p>
          <p class="expire-tip">
            二维码有效期 {{ remainingTime }} 秒
            <el-button v-if="remainingTime <= 0" link type="primary" @click="refreshQrCode">
              刷新二维码
            </el-button>
          </p>
        </div>
      </div>

      <div class="qr-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="openInNewWindow">
          在新窗口中打开
        </el-button>
      </div>
    </div>

    <!-- 步骤 2：扫码成功，等待确认 -->
    <div v-else-if="step === 'confirming'" class="confirm-container">
      <el-icon :size="48" color="#07c160"><CircleCheck /></el-icon>
      <p>扫码成功，请在微信中确认授权</p>
      <el-button @click="handleCancel">取消</el-button>
    </div>

    <!-- 步骤 3：绑定成功 -->
    <div v-else-if="step === 'success'" class="success-container">
      <el-icon :size="48" color="#67c23a"><SuccessFilled /></el-icon>
      <p>微信绑定成功！</p>
      <div v-if="wxUserInfo" class="wx-user-info">
        <el-avatar :src="wxUserInfo.avatarUrl" :size="64" />
        <span>{{ wxUserInfo.nickname }}</span>
      </div>
      <el-button type="primary" @click="handleSuccess">继续</el-button>
    </div>

    <!-- 步骤 4：绑定失败 -->
    <div v-else-if="step === 'error'" class="error-container">
      <el-icon :size="48" color="#f56c6c"><CircleClose /></el-icon>
      <p>{{ errorMessage }}</p>
      <el-button type="primary" @click="refreshQrCode">重新扫码</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ChatLineSquare,
  Loading,
  CircleCheck,
  SuccessFilled,
  CircleClose
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAccountStore } from '@/stores/account'
import { WX_CONFIG, buildWxOAuthUrl, parseAuthCodeFromUrl } from '@/config/wx'
import type { WxUserInfo } from '@/types/api'

type StepType = 'scanning' | 'confirming' | 'success' | 'error'

const emit = defineEmits<{
  (e: 'success', data: WxUserInfo): void
  (e: 'cancel'): void
}>()

const accountStore = useAccountStore()

const step = ref<StepType>('scanning')
const loading = ref(true)
const errorMessage = ref('')
const wxUserInfo = ref<WxUserInfo | null>(null)
const remainingTime = ref(WX_CONFIG.expireSeconds)
const wxIframe = ref<HTMLIFrameElement | null>(null)
const popupWindow = ref<Window | null>(null)

let expireTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let popupCheckTimer: ReturnType<typeof setInterval> | null = null

// 微信 OAuth URL
const wxOAuthUrl = computed(() => buildWxOAuthUrl())

// iframe 加载完成
function onIframeLoad() {
  loading.value = false
}

// 刷新二维码
function refreshQrCode() {
  step.value = 'scanning'
  loading.value = true
  errorMessage.value = ''
  remainingTime.value = WX_CONFIG.expireSeconds
  startExpireTimer()

  // 重新加载 iframe
  if (wxIframe.value) {
    wxIframe.value.src = wxOAuthUrl.value
  }
}

// 在新窗口中打开
function openInNewWindow() {
  const width = 500
  const height = 600
  const left = (window.innerWidth - width) / 2 + window.screenX
  const top = (window.innerHeight - height) / 2 + window.screenY

  popupWindow.value = window.open(
    wxOAuthUrl.value,
    'wechat_auth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  )

  // 开始检测弹窗状态
  startPopupCheck()
}

// 开始检测弹窗状态
function startPopupCheck() {
  if (popupCheckTimer) {
    clearInterval(popupCheckTimer)
  }

  popupCheckTimer = setInterval(() => {
    if (!popupWindow.value || popupWindow.value.closed) {
      clearInterval(popupCheckTimer!)
      popupCheckTimer = null
      // 弹窗关闭，可能是用户取消或授权完成
      // 这里需要检查是否有授权码
    } else {
      // 尝试获取弹窗 URL（可能因跨域而失败）
      try {
        const popupUrl = popupWindow.value.location.href
        const code = parseAuthCodeFromUrl(popupUrl)
        if (code) {
          popupWindow.value.close()
          handleAuthCode(code)
        }
      } catch {
        // 跨域错误，忽略
      }
    }
  }, 500)
}

// 处理授权码
async function handleAuthCode(code: string) {
  step.value = 'confirming'

  const result = await accountStore.bindWithWxCode({ code })

  if (result.success && result.data) {
    wxUserInfo.value = result.data
    step.value = 'success'
    ElMessage.success('微信绑定成功')
  } else {
    errorMessage.value = result.message || '绑定失败'
    step.value = 'error'
  }
}

// 开始过期倒计时
function startExpireTimer() {
  if (expireTimer) {
    clearInterval(expireTimer)
  }

  expireTimer = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(expireTimer!)
      expireTimer = null
    }
  }, 1000)
}

// 监听来自回调页面的消息
function handleMessage(event: MessageEvent) {
  // 验证消息来源
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data && event.data.type === 'WX_AUTH_CODE') {
    const code = event.data.code
    if (code) {
      handleAuthCode(code)
    }
  }
}

// 取消
function handleCancel() {
  if (popupWindow.value && !popupWindow.value.closed) {
    popupWindow.value.close()
  }
  emit('cancel')
}

// 成功
function handleSuccess() {
  if (wxUserInfo.value) {
    emit('success', wxUserInfo.value)
  }
}

// 清理定时器
function cleanup() {
  if (expireTimer) {
    clearInterval(expireTimer)
    expireTimer = null
  }
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (popupCheckTimer) {
    clearInterval(popupCheckTimer)
    popupCheckTimer = null
  }
  window.removeEventListener('message', handleMessage)
}

onMounted(() => {
  startExpireTimer()
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  cleanup()
})

// 监听步骤变化，清理定时器
watch(step, (newStep) => {
  if (newStep !== 'scanning') {
    if (expireTimer) {
      clearInterval(expireTimer)
      expireTimer = null
    }
  }
})
</script>

<style scoped>
.wechat-qr-bind {
  padding: 20px;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  color: #07c160;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-frame-wrapper {
  position: relative;
  width: 300px;
  height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.wx-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.qr-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  gap: 10px;
}

.loading-icon {
  font-size: 32px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.qr-tips {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.qr-tips p {
  margin: 4px 0;
}

.expire-tip {
  color: #999;
  font-size: 12px;
}

.qr-footer {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.confirm-container,
.success-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
}

.wx-user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.wx-user-info span {
  font-size: 16px;
  font-weight: 500;
}
</style>
