<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
      <div class="logo-container">
        <span v-if="!isCollapse" class="logo-text">游戏托管平台</span>
        <span v-else class="logo-text-short">游</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>

        <el-menu-item index="/accounts">
          <el-icon><User /></el-icon>
          <template #title>游戏账号</template>
        </el-menu-item>

        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <template #title>角色配置</template>
        </el-menu-item>

        <el-sub-menu index="/tasks">
          <template #title>
            <el-icon><List /></el-icon>
            <span>任务管理</span>
          </template>
          <el-menu-item index="/tasks">任务列表</el-menu-item>
          <el-menu-item index="/tasks/charm">符咒抢购</el-menu-item>
          <el-menu-item index="/tasks/monitor">任务监控</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span class="username">{{ userStore.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="wx-bind">
                  <el-icon><Link /></el-icon>
                  微信绑定
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  User,
  Setting,
  List,
  Fold,
  Expand,
  ArrowDown,
  Link,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function handleCommand(command: string) {
  if (command === 'wx-bind') {
    router.push('/wx-bind')
  } else if (command === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3544;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.logo-text-short {
  font-size: 20px;
}

.sidebar-menu {
  border-right: none;
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #ffffff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #ffffff;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #263445;
  color: #ffffff;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.layout-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 10px;
}

.username {
  font-size: 14px;
  color: #303133;
}

.layout-main {
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
