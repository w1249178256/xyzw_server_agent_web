/// <reference types="vite/client" />

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

interface Window {
  wx_errcode?: number | string
  wx_redirecturl?: string
  wx_nickname?: string
  WeixinJSBridge?: {
    invoke: (method: string, params: Record<string, unknown>, callback: () => void) => void
  }
}

interface ImportMetaEnv {
  readonly VITE_WX_UUID?: string
  readonly VITE_WX_APP_ID?: string
  readonly VITE_WX_APP_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
