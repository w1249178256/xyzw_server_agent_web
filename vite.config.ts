import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 微信 uuid 获取插件（开发环境用）
function wxUuidPlugin() {
  return {
    name: 'wx-uuid-proxy',
    configureServer(server: any) {
      // 获取微信 OAuth uuid
      server.middlewares.use('/api/wx/uuid', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        try {
          const wxConfig = {
            appId: 'wxfb0d5667e5cb1c44',
            bundleId: 'com.hortor.games.xyzw',
            scope: 'snsapi_base,snsapi_userinfo,snsapi_friend,snsapi_message',
            state: 'weixin'
          }

          const params = new URLSearchParams({
            appid: wxConfig.appId,
            bundleId: wxConfig.bundleId,
            scope: wxConfig.scope,
            state: wxConfig.state,
            response_type: 'code'
          })

          const wxUrl = `https://open.weixin.qq.com/connect/app/qrconnect?${params.toString()}`
          console.log('Fetching WeChat OAuth page:', wxUrl)

          const response = await fetch(wxUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            }
          })

          const html = await response.text()
          console.log('Got HTML, length:', html.length)

          // 提取 uuid
          const uuidMatch = html.match(/uuid:\s*["']([^"']+)["']/)
            || html.match(/uuid\s*=\s*["']([^"']+)["']/)
            || html.match(/\/connect\/qrcode\/([a-zA-Z0-9_-]+)/i)

          const uuid = uuidMatch ? uuidMatch[1] : null
          console.log('Extracted uuid:', uuid)

          if (!uuid) {
            console.log('HTML preview:', html.substring(0, 2000))
            res.end(JSON.stringify({
              success: false,
              code: -1,
              msg: '无法提取 uuid',
              debug: {
                htmlLength: html.length,
                htmlPreview: html.substring(0, 1500)
              }
            }))
            return
          }

          res.end(JSON.stringify({
            success: true,
            code: 0,
            data: {
              uuid: uuid,
              appid: wxConfig.appId
            }
          }))
        } catch (error: any) {
          console.error('Error:', error)
          res.end(JSON.stringify({
            success: false,
            code: -1,
            msg: error.message
          }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), wxUuidPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://114.55.25.68:7001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
