<template>
  <div class="wx-callback">
    <div class="callback-content">
      <el-icon v-if="status === 'loading'" class="loading-icon" :size="48">
        <Loading />
      </el-icon>
      <el-icon v-else-if="status === 'success'" :size="48" color="#67c23a">
        <SuccessFilled />
      </el-icon>
      <el-icon v-else :size="48" color="#f56c6c">
        <CircleClose />
      </el-icon>

      <p class="message">{{ message }}</p>

      <p v-if="status === 'success'" class="hint">
        页面将自动关闭，如未关闭请手动关闭此窗口
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Loading, SuccessFilled, CircleClose } from '@element-plus/icons-vue'

type StatusType = 'loading' | 'success' | 'error'

const route = useRoute()

const status = ref<StatusType>('loading')
const message = ref('正在处理授权...')

onMounted(() => {
  // 从 URL 中获取授权码
  const code = route.query.code as string
  const state = route.query.state as string
  const error = route.query.error as string

  if (error) {
    status.value = 'error'
    message.value = '授权被取消或失败'
    return
  }

  if (!code) {
    status.value = 'error'
    message.value = '未获取到授权码'
    return
  }

  // 发送消息给父窗口
  if (window.opener) {
    try {
      window.opener.postMessage(
        {
          type: 'WX_AUTH_CODE',
          code,
          state
        },
        window.location.origin
      )

      status.value = 'success'
      message.value = '授权成功'

      // 延迟关闭窗口
      setTimeout(() => {
        window.close()
      }, 1500)
    } catch (err) {
      status.value = 'error'
      message.value = '处理授权信息失败'
    }
  } else {
    // 没有父窗口，可能是直接访问
    // 保存 code 到 localStorage，让主页面读取
    localStorage.setItem('wx_auth_code', code)
    localStorage.setItem('wx_auth_state', state || '')

    status.value = 'success'
    message.value = '授权成功，请返回原页面'
  }
})
</script>

<style scoped>
.wx-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.callback-content {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-icon {
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

.message {
  margin-top: 20px;
  font-size: 16px;
  color: #333;
}

.hint {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}
</style>
