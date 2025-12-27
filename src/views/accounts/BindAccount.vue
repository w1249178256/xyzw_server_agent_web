<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">绑定游戏账号</h2>
    </div>

    <el-card style="max-width: 600px">
      <el-form
        ref="bindFormRef"
        :model="bindForm"
        :rules="bindRules"
        label-width="100px"
      >
        <el-form-item label="账号信息" prop="context">
          <el-input
            v-model="bindForm.context"
            type="textarea"
            :rows="4"
            placeholder="请输入游戏账号信息（JSON格式或其他格式）"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="bindForm.remark"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleBind" :loading="loading">
            绑定账号
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
import { useAccountStore } from '@/stores/account'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const accountStore = useAccountStore()

const bindFormRef = ref<FormInstance>()
const loading = ref(false)

const bindForm = reactive({
  context: '',
  remark: ''
})

const bindRules: FormRules = {
  context: [
    { required: true, message: '请输入账号信息', trigger: 'blur' }
  ],
  remark: [
    { required: true, message: '请输入备注', trigger: 'blur' }
  ]
}

async function handleBind() {
  if (!bindFormRef.value) return

  await bindFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await accountStore.createBind(bindForm)
        if (success) {
          ElMessage.success('绑定成功')
          router.push('/accounts')
        } else {
          ElMessage.error('绑定失败')
        }
      } catch (error) {
        ElMessage.error('绑定失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
