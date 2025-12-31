<template>
  <div class="page-container">
    <div class="bind-wrapper">
      <div class="card">
        <!-- Tab 切换 -->
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'wx' }]"
            @click="activeTab = 'wx'"
          >
            微信扫码
          </button>
          <button
            :class="['tab', { active: activeTab === 'sms' }]"
            @click="activeTab = 'sms'"
          >
            手机验证码
          </button>
        </div>

        <!-- 微信扫码绑定 -->
        <div v-if="activeTab === 'wx'" class="tab-content">
          <div v-if="wxState === 'scan'">
            <h3 class="title">请使用手机微信扫描二维码授权绑定</h3>

            <img
              v-if="qrImgUrl"
              class="qrcode"
              :src="qrImgUrl"
              alt="微信扫码二维码"
              @load="onQrLoaded"
            />
            <div v-else class="qrcode qrcode-placeholder">
              {{ loadingQr ? '二维码加载中...' : '二维码参数缺失' }}
            </div>

            <div class="sub">{{ appName }}</div>
            <div class="tips">扫码只用于授权，不会登录你的 iPad 微信</div>

            <div class="actions">
              <button class="btn ghost" @click="cancelLogin">取消绑定</button>
              <button class="btn ghost" @click="refreshQr">刷新二维码</button>
            </div>
          </div>

          <div v-else-if="wxState === 'succ'">
            <h3 class="title">{{ wxNickname }} 授权成功</h3>
            <div class="tips">跳转中...</div>
          </div>

          <div v-else>
            <h3 class="title">绑定异常</h3>
            <div class="tips">{{ wxErrorMsg }}</div>
            <button class="btn" @click="reload">重试</button>
          </div>
        </div>

        <!-- 手机验证码绑定 -->
        <div v-if="activeTab === 'sms'" class="tab-content">
          <div v-if="smsState === 'input'">
            <h3 class="title">使用手机验证码绑定</h3>
            <div class="tips" style="margin-bottom: 20px">
              请使用游戏账号绑定的手机号进行验证
            </div>

            <div class="form-group">
              <input
                v-model="phoneForm.phone"
                type="tel"
                class="input"
                placeholder="请输入手机号"
                maxlength="11"
              />
            </div>

            <div class="form-group code-group">
              <input
                v-model="phoneForm.smsCode"
                type="text"
                class="input code-input"
                placeholder="请输入6位验证码"
                maxlength="6"
              />
              <button
                class="btn send-btn"
                :disabled="countdown > 0 || !phoneForm.phone || smsLoading"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </button>
            </div>

            <button
              class="btn primary full"
              :disabled="!phoneForm.phone || !phoneForm.smsCode || smsLoading"
              @click="handleSmsBind"
            >
              {{ smsLoading ? '验证中...' : '验证并绑定' }}
            </button>

            <div v-if="smsErrorMsg" class="error-msg">{{ smsErrorMsg }}</div>
          </div>

          <div v-else-if="smsState === 'succ'">
            <h3 class="title">绑定成功</h3>
            <div class="tips">跳转中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {wxBind} from '@/api/modules/wx'
import {useAccountStore} from '@/stores/account'

const route = useRoute()
const router = useRouter()
const accountStore = useAccountStore()

// Tab 状态 - 支持通过 URL query 参数设置默认 tab
const tabFromQuery = route.query.tab as string
const activeTab = ref<'wx' | 'sms'>(tabFromQuery === 'sms' ? 'sms' : 'wx')

// 公共配置
const DEFAULT_APP_NAME = '咸鱼之王官方版'
const FIXED_APP_ID = 'wxfb0d5667e5cb1c44'
const WX_QR_IMG_BASE = 'https://open.weixin.qq.com/connect/qrcode/'
const WX_QR_POLL_URL = 'https://long.open.weixin.qq.com/connect/l/qrconnect'
const WX_QR_CONNECT_API = '/api/wx/qrconnect'

const redirectTo = computed(() => (route.query.redirect as string) || '/accounts')

// ========== 微信扫码相关 ==========
const uuid = ref(
  (route.query.uuid as string) || (import.meta.env.VITE_WX_UUID as string) || ''
)
const appid = ref(FIXED_APP_ID)
const appName = ref(
  (route.query.appName as string) ||
  (import.meta.env.VITE_WX_APP_NAME as string) ||
  DEFAULT_APP_NAME
)

const wxState = ref<'scan' | 'succ' | 'err'>('scan')
const wxNickname = ref('')
const wxErrorMsg = ref('')
const loadingQr = ref(false)

let started = false
let stopped = false
let timer: ReturnType<typeof setTimeout> | null = null
let qrFetchController: AbortController | null = null
const qrImgOverride = ref('')

const qrImgUrl = computed(() => {
  if (qrImgOverride.value) return qrImgOverride.value
  if (!uuid.value) return ''
  return `${WX_QR_IMG_BASE}${encodeURIComponent(uuid.value)}`
})

function loadWxScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => {
      script.remove()
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject(new Error('load script failed'))
    }
    document.head.appendChild(script)
  })
}

function scheduleNext(ms: number) {
  if (stopped) return
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => pollOnce(), ms)
}

async function handleWxBind(code: string) {
  try {
    await wxBind({code})
    router.replace(redirectTo.value)
  } catch (error: any) {
    wxState.value = 'err'
    wxErrorMsg.value = error?.message || '微信绑定失败，请重试'
  }
}

async function pollOnce() {
  if (stopped) return
  if (!uuid.value) {
    if (!loadingQr.value) {
      wxState.value = 'err'
      wxErrorMsg.value = '缺少微信二维码参数，请检查页面配置'
    }
    return
  }

  const url =
    `${WX_QR_POLL_URL}?uuid=${encodeURIComponent(uuid.value)}` +
    `&f=url&_=${Date.now()}`

  try {
    window.wx_errcode = undefined
    window.wx_redirecturl = undefined
    window.wx_nickname = undefined

    await loadWxScript(url)

    const errCodeRaw = window.wx_errcode
    const errCode =
      typeof errCodeRaw === 'string' ? Number(errCodeRaw) : errCodeRaw
    const redirectUrl = window.wx_redirecturl
    const nickname = window.wx_nickname

    switch (errCode) {
      case 405: {
        wxNickname.value = nickname || '微信用户'
        wxState.value = 'succ'
        stopPolling()

        const match = redirectUrl?.match(/[?&]code=([^&]+)/)
        const code = match && match[1] ? match[1] : null
        if (!code) {
          throw new Error('未能从 redirect_url 提取 code')
        }

        await handleWxBind(code)
        return
      }

      case 404:
        scheduleNext(1000)
        return

      case 408:
        scheduleNext(2000)
        return

      case 403:
      case 402:
      case 500:
        window.location.reload()
        return

      default:
        scheduleNext(1500)
        return
    }
  } catch (error) {
    scheduleNext(5000)
  }
}

function startPolling() {
  if (started || stopped) return
  started = true
  pollOnce()
}

function stopPolling() {
  stopped = true
  if (timer) {
    clearTimeout(timer)
  }
}

function onQrLoaded() {
  startPolling()
}

async function hydrateFromBackend(force = false) {
  if (uuid.value && !force) return
  loadingQr.value = true
  wxErrorMsg.value = ''

  if (qrFetchController) {
    qrFetchController.abort()
  }
  const controller = new AbortController()
  qrFetchController = controller

  try {
    const res = await fetch(WX_QR_CONNECT_API, {signal: controller.signal})
    if (!res.ok) {
      throw new Error('获取二维码失败')
    }
    const payload = await res.json()
    if (payload?.code !== 0) {
      throw new Error(payload?.msg || '获取二维码失败')
    }
    const data = payload?.data || {}
    if (!data.uuid) {
      throw new Error('未解析到二维码参数')
    }

    uuid.value = data.uuid
    if (data.appid) {
      appid.value = data.appid
    }
    if (data.appName) {
      appName.value = data.appName
    }
    qrImgOverride.value = data.qrUrl || ''

    setTimeout(() => {
      if (!started) startPolling()
    }, 3000)
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return
    }
    wxState.value = 'err'
    wxErrorMsg.value = error?.message || '二维码加载失败'
  } finally {
    if (qrFetchController === controller) {
      qrFetchController = null
    }
    loadingQr.value = false
  }
}

function cancelLogin() {
  stopPolling()
  router.back()
}

function reload() {
  window.location.reload()
}

async function refreshQr() {
  stopPolling()
  started = false
  stopped = false
  uuid.value = ''
  qrImgOverride.value = ''
  wxNickname.value = ''
  wxState.value = 'scan'
  await hydrateFromBackend(true)
}

// ========== 手机验证码相关 ==========
const smsState = ref<'input' | 'succ'>('input')
const smsLoading = ref(false)
const smsErrorMsg = ref('')
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const phoneForm = ref({
  phone: '',
  smsCode: ''
})

async function handleSendCode() {
  if (!/^1\d{10}$/.test(phoneForm.value.phone)) {
    smsErrorMsg.value = '请输入正确的手机号'
    return
  }

  smsLoading.value = true
  smsErrorMsg.value = ''

  try {
    const result = await accountStore.sendBindCode({
      phone: phoneForm.value.phone
    })

    if (result.success) {
      startCountdown()
    } else {
      smsErrorMsg.value = result.message || '发送失败'
    }
  } catch (error: any) {
    smsErrorMsg.value = error?.message || '发送失败，请稍后重试'
  } finally {
    smsLoading.value = false
  }
}

function startCountdown() {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

async function handleSmsBind() {
  if (!/^1\d{10}$/.test(phoneForm.value.phone)) {
    smsErrorMsg.value = '请输入正确的手机号'
    return
  }
  if (!/^\d{6}$/.test(phoneForm.value.smsCode)) {
    smsErrorMsg.value = '请输入6位数字验证码'
    return
  }

  smsLoading.value = true
  smsErrorMsg.value = ''

  try {
    const result = await accountStore.bindWithCode({
      phone: phoneForm.value.phone,
      smsCode: phoneForm.value.smsCode
    })

    if (result.success) {
      smsState.value = 'succ'
      setTimeout(() => {
        router.replace(redirectTo.value)
      }, 1000)
    } else {
      smsErrorMsg.value = result.message || '验证码错误，请重新输入'
    }
  } catch (error: any) {
    smsErrorMsg.value = error?.message || '绑定失败，请稍后重试'
  } finally {
    smsLoading.value = false
  }
}

// Tab 切换时管理轮询
watch(activeTab, (newTab) => {
  if (newTab === 'wx') {
    // 切换到微信时
    if (!uuid.value) {
      // 如果还没加载过二维码，加载它
      hydrateFromBackend()
    } else if (!started) {
      // 如果有 uuid 但还没开始轮询，启动轮询
      stopped = false
      startPolling()
    }
  } else {
    // 切换到其他tab时暂停轮询
    stopPolling()
    started = false
    stopped = false
  }
})

onMounted(() => {
  // 只在默认 tab 是微信时才加载二维码
  if (activeTab.value === 'wx') {
    hydrateFromBackend()
  }

  if (window.WeixinJSBridge?.invoke) {
    window.WeixinJSBridge.invoke(
      'setNavigationBarColor',
      {color: '#F3F3F3'},
      () => {
      }
    )
  }
})

onBeforeUnmount(() => {
  stopPolling()
  qrFetchController?.abort()
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.bind-wrapper {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(400px, 92vw);
  background: #fff;
  border-radius: 14px;
  padding: 0;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  padding: 14px 0;
  border: none;
  background: #fafafa;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #fff;
  color: #1677ff;
  border-bottom: 2px solid #1677ff;
}

.tab-content {
  padding: 24px 18px;
}

.title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
}

.qrcode {
  width: 180px;
  height: 180px;
  border-radius: 10px;
  background: #fafafa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.qrcode-placeholder {
  border: 1px dashed #dcdfe6;
}

.sub {
  margin-top: 10px;
  font-weight: 600;
}

.tips {
  margin: 12px 0 16px;
  color: #888;
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  border: 0;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  background: #1677ff;
  color: #fff;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
  color: #607fa6;
}

.btn.primary {
  background: #1677ff;
  color: #fff;
}

.btn.full {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 14px;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  border-color: #1677ff;
}

.code-group {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.send-btn {
  white-space: nowrap;
  padding: 12px 14px;
  min-width: 100px;
}

.error-msg {
  margin-top: 12px;
  color: #f56c6c;
  font-size: 13px;
}
</style>
