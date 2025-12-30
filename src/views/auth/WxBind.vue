<template>
  <div class="page-container">
    <div class="wx-login">
      <div v-if="state === 'scan'" class="card">
        <h3 class="title">请使用手机微信扫描二维码授权绑定</h3>

        <img
            v-if="qrImgUrl"
            class="qrcode"
            :src="qrImgUrl"
            alt="微信扫码二维码"
            @load="onQrLoaded"
        />
        <div v-else-if="wechatAuthUrl" class="qrcode qrcode-frame">
          <iframe
              ref="authIframe"
              class="qr-iframe"
              :src="wechatAuthUrl"
              :key="iframeKey"
              title="微信扫码登录"
              @load="onIframeLoad"
          ></iframe>
        </div>
        <div v-else class="qrcode qrcode-placeholder">缺少微信AppID，请检查配置</div>

        <div class="sub">{{ appName }}</div>
        <div class="tips">扫码只用于授权，不会登录你的 iPad 微信</div>

        <div class="actions">
          <button class="btn ghost" @click="cancelLogin">取消绑定</button>
          <button class="btn ghost" @click="refreshQr">刷新二维码</button>
          <button v-if="wechatAuthUrl" class="btn ghost" @click="openPopup">
            打开扫码窗口
          </button>
        </div>
      </div>

      <div v-else-if="state === 'succ'" class="card">
        <h3 class="title">{{ wxNickname }} 授权成功</h3>
        <div class="tips">跳转中...</div>
      </div>

      <div v-else class="card">
        <h3 class="title">绑定异常</h3>
        <div class="tips">{{ errorMsg }}</div>
        <button class="btn" @click="reload">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {wxBind} from '@/api/modules/wx'
import {useUserStore} from '@/stores/user'
import type {WxBindRequest} from '@/types/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const DEFAULT_APP_NAME = '咸鱼之王官方版'
const FIXED_APP_ID = 'wxfb0d5667e5cb1c44'
const WX_QR_IMG_BASE = 'https://open.weixin.qq.com/connect/qrcode/'
const WX_QR_POLL_URL = 'https://long.open.weixin.qq.com/connect/l/qrconnect'
const WX_QR_CONNECT_URL = 'https://open.weixin.qq.com/connect/app/qrconnect'
const WX_QR_BUNDLE_ID = 'com.hortor.games.xyzw'

const uuid = ref(
    (route.query.uuid as string) || (import.meta.env.VITE_WX_UUID as string) || ''
)
const appid = ref(FIXED_APP_ID)
const appName = ref(
    (route.query.appName as string) ||
    (import.meta.env.VITE_WX_APP_NAME as string) ||
    DEFAULT_APP_NAME
)
const redirectTo = computed(() => (route.query.redirect as string) || '/accounts')
const redirectUri = computed(() => `${window.location.origin}/wx-callback`)

const state = ref<'scan' | 'succ' | 'err'>('scan')
const wxNickname = ref('')
const errorMsg = ref('')

let started = false
let stopped = false
let timer: ReturnType<typeof setTimeout> | null = null
const iframeKey = ref(0)
const authIframe = ref<HTMLIFrameElement | null>(null)
let popupWindow: Window | null = null
let authHandled = false

const qrImgUrl = computed(() => {
  if (!uuid.value) return ''
  return `${WX_QR_IMG_BASE}${encodeURIComponent(uuid.value)}`
})
const wechatAuthUrl = computed(() => {
  if (uuid.value || !appid.value) return ''
  const scope = 'snsapi_base,snsapi_userinfo,snsapi_friend,snsapi_message'
  const stateValue = 'weixin'
  const query = new URLSearchParams({
    appid: appid.value,
    bundleid: WX_QR_BUNDLE_ID,
    response_type: 'code',
    scope,
    state: stateValue
  })
  return `${WX_QR_CONNECT_URL}?${query.toString()}#wechat_redirect`
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

async function handleBind(code: string) {
  try {
    const payload: WxBindRequest = {code}
    if (userStore.userId) {
      payload.userId = userStore.userId
    }

    await wxBind(payload)
    router.replace(redirectTo.value)
  } catch (error: any) {
    state.value = 'err'
    errorMsg.value = error?.message || '微信绑定失败，请重试'
    authHandled = false
  }
}

async function pollOnce() {
  if (stopped) return
  if (!uuid.value) {
    if (!wechatAuthUrl.value) {
      state.value = 'err'
      errorMsg.value = '缺少微信二维码参数，请检查页面配置'
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
        state.value = 'succ'
        stopPolling()

        const code = match && match[1] ? match[1] : null
        if (!code) {
          throw new Error('未能从 redirect_url 提取 code')
        }

        await handleBind(code)
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

function finalizeAuth(code: string) {
  if (authHandled) return
  authHandled = true
  wxNickname.value = wxNickname.value || '微信用户'
  state.value = 'succ'
  handleBind(code)
}

function onIframeLoad() {
  tryReadAuthCodeFromIframe()
}

function tryReadAuthCodeFromIframe() {
  const frame = authIframe.value
  if (!frame?.contentWindow) return
  try {
    const href = frame.contentWindow.location.href
    if (href && href.startsWith(window.location.origin)) {
      const url = new URL(href)
      const code = url.searchParams.get('code')
      if (code) {
        finalizeAuth(code)
      }
    }
  } catch (_) {
    // ignore cross-origin access until redirect back
  }
}

function handleAuthMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  const data = event.data
  if (data?.type === 'WX_AUTH_CODE' && data.code) {
    finalizeAuth(data.code)
  }
}

function openPopup() {
  if (!wechatAuthUrl.value) return
  popupWindow?.close()
  popupWindow = window.open(
      wechatAuthUrl.value,
      'wx_oauth',
      'width=520,height=620,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
  )
}

function cancelLogin() {
  stopPolling()
  authHandled = false
  if (appid.value) {
    window.location.href = `${appid.value}://oauth11?code=`
    return
  }
  window.location.reload()
}

function reload() {
  window.location.reload()
}

onMounted(() => {
  if (uuid.value) {
    setTimeout(() => {
      if (!started) startPolling()
    }, 3000)
  }

  window.addEventListener('message', handleAuthMessage)

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
  popupWindow?.close()
  window.removeEventListener('message', handleAuthMessage)
})

function refreshQr() {
  stopPolling()
  started = false
  stopped = false
  wxNickname.value = ''
  state.value = 'scan'
  authHandled = false

  if (uuid.value) {
    window.location.reload()
    return
  }

  iframeKey.value += 1
  popupWindow?.close()
}
</script>

<style scoped>
.wx-login {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(380px, 92vw);
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
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

.qrcode-frame {
  padding: 0;
  background: transparent;
}

.qr-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 10px;
  background: #fff;
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
}

.btn.ghost {
  background: transparent;
  color: #607fa6;
}
</style>
