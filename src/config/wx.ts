// 微信开放平台配置
export const WX_CONFIG = {
  // 微信开放平台应用 ID（需要替换为实际的 appId）
  appId: 'wx1234567890',

  // 授权范围
  scope: 'snsapi_base,snsapi_userinfo,snsapi_friend,snsapi_message',

  // 授权回调地址（需要替换为实际的回调地址）
  // 开发环境使用本地地址，生产环境使用实际域名
  get redirectUri() {
    const baseUrl = window.location.origin
    return `${baseUrl}/wx-callback`
  },

  // 微信 OAuth 基础 URL
  oauthBaseUrl: 'https://open.weixin.qq.com/connect/app/qrconnect',

  // 状态参数
  state: 'weixin',

  // 二维码过期时间（秒）
  expireSeconds: 180,

  // 轮询间隔（毫秒）
  pollInterval: 2000
}

// 构建微信 OAuth URL
export function buildWxOAuthUrl(): string {
  const params = new URLSearchParams({
    appid: WX_CONFIG.appId,
    scope: WX_CONFIG.scope,
    state: WX_CONFIG.state,
    response_type: 'code'
  })

  return `${WX_CONFIG.oauthBaseUrl}?${params.toString()}`
}

// 从 URL 中解析授权码
export function parseAuthCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('code')
  } catch {
    return null
  }
}
