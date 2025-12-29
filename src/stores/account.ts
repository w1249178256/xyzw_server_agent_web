import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getBindList,
  bindAccount,
  getGameRole,
  syncRoleData,
  getAvailableRoles,
  addRole,
  batchAddRoles,
  deleteRole,
  sendBindSmsCode,
  bindWithSmsCode
} from '@/api/modules/account'
import { wxBind, wxBindStatus, wxUnbind } from '@/api/modules/wx'
import type { GameBind, GameRole } from '@/types/models'
import type {
  BindRequest,
  BindRoleResult,
  Role,
  AddRoleRequest,
  BatchAddRolesRequest,
  BatchAddRolesResponse,
  SendBindSmsCodeRequest,
  BindWithSmsCodeRequest,
  WxBindRequest,
  WxUserInfo
} from '@/types/api'

export const useAccountStore = defineStore('account', () => {

  const bindList = ref<GameBind[]>([])
  const currentBindId = ref<number | null>(null)
  const currentRoles = ref<GameRole[]>([])
  const availableRoles = ref<Role[]>([]) // 游戏账号下的所有可用角色
  const loading = ref(false)
  const wxUserInfo = ref<WxUserInfo | null>(null) // 微信用户信息

  async function fetchBindList() {
    loading.value = true
    try {
      const res = await getBindList({})
      if (res.data?.bindInfo) {
        bindList.value = res.data.bindInfo.map(item => ({
          bindId: item.bindId,
          remark: item.remark,
          roles: []
        }))
      }
    } catch (error) {
      console.error('Failed to fetch bind list:', error)
    } finally {
      loading.value = false
    }
  }

  async function createBind(data: BindRequest) {
    try {
      const res = await bindAccount(data)
      if (res.code === 200 || res.code === 0) {
        await fetchBindList()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to bind account:', error)
      return false
    }
  }

  async function fetchRoles(bindId: number) {
    loading.value = true
    try {
      const data: BindRoleResult = {
        bindId
        // roleId 非必传，查询所有角色时不传
      }
      const res = await getGameRole(data)
      if (res.data?.roleInfos) {
        const roles = res.data.roleInfos.map(role => ({
          roleId: role.roleId,
          serverName: role.serverName,
          roleName: role.roleName,
          level: role.level,
          power: role.power
        }))

        const bind = bindList.value.find(b => b.bindId === bindId)
        if (bind) {
          bind.roles = roles
        }

        currentRoles.value = roles
        return roles
      }
      return []
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function syncRoles(bindId: number) {
    loading.value = true
    try {
      const res = await syncRoleData({ bindId })
      if (res.code === 200 || res.code === 0) {
        await fetchRoles(bindId)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to sync roles:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  function selectBind(bindId: number) {
    currentBindId.value = bindId
  }

  // 获取游戏账号下的所有可用角色
  async function fetchAvailableRoles(bindId: number) {
    loading.value = true
    try {
      const res = await getAvailableRoles({ bindId })
      if (res.data) {
        availableRoles.value = res.data
        return res.data
      }
      return []
    } catch (error) {
      console.error('Failed to fetch available roles:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  // 添加游戏角色到平台用户
  async function bindRole(data: AddRoleRequest) {
    loading.value = true
    try {
      const res = await addRole(data)
      if (res.code === 200 || res.code === 0) {
        // 重新获取已绑定角色列表
        await fetchRoles(data.bindId)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to bind role:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量添加游戏角色到平台用户
  async function batchBindRoles(data: BatchAddRolesRequest) {
    loading.value = true
    try {
      const res = await batchAddRoles(data)
      if (res.code === 200 || res.code === 0) {
        // 重新获取已绑定角色列表
        await fetchRoles(data.bindId)
        return res.data as BatchAddRolesResponse
      }
      return null
    } catch (error) {
      console.error('Failed to batch bind roles:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除已绑定的游戏角色
  async function removeRole(roleId: number, bindId?: number) {
    loading.value = true
    try {
      const res = await deleteRole({ roleId })
      if (res.code === 200 || res.code === 0) {
        // 如果提供了 bindId，重新获取该绑定下的角色列表
        if (bindId) {
          await fetchRoles(bindId)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove role:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 发送绑定验证码
  async function sendBindCode(data: SendBindSmsCodeRequest) {
    try {
      const res = await sendBindSmsCode(data)
      if (res.code === 200 || res.code === 0) {
        return { success: true, message: res.msg }
      }
      return { success: false, message: res.msg || '发送失败' }
    } catch (error) {
      console.error('Failed to send bind sms code:', error)
      return { success: false, message: '发送失败，请稍后重试' }
    }
  }

  // 使用验证码绑定账号
  async function bindWithCode(data: BindWithSmsCodeRequest) {
    loading.value = true
    try {
      const res = await bindWithSmsCode(data)
      if (res.code === 200 || res.code === 0) {
        // 绑定成功后，重新获取绑定列表
        await fetchBindList()
        return { success: true, message: res.msg }
      }
      return { success: false, message: res.msg || '绑定失败' }
    } catch (error) {
      console.error('Failed to bind with sms code:', error)
      return { success: false, message: '绑定失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  // 获取最新的 bindId
  function getLatestBindId(): number | null {
    if (bindList.value.length === 0) {
      return null
    }
    return bindList.value[bindList.value.length - 1].bindId
  }

  // 使用微信授权码绑定账号
  async function bindWithWxCode(data: WxBindRequest) {
    loading.value = true
    try {
      const res = await wxBind(data)
      if (res.code === 200 || res.code === 0) {
        wxUserInfo.value = res.data
        // 绑定成功后，重新获取绑定列表
        await fetchBindList()
        return { success: true, message: '微信绑定成功', data: res.data }
      }
      return { success: false, message: res.msg || '微信绑定失败' }
    } catch (error) {
      console.error('Failed to bind with wx code:', error)
      return { success: false, message: '微信绑定失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  // 查询微信绑定状态
  async function fetchWxBindStatus() {
    try {
      const res = await wxBindStatus()
      if (res.code === 200 || res.code === 0) {
        wxUserInfo.value = res.data
        return res.data
      }
      return null
    } catch (error) {
      console.error('Failed to fetch wx bind status:', error)
      return null
    }
  }

  // 解绑微信
  async function unbindWx() {
    loading.value = true
    try {
      const res = await wxUnbind()
      if (res.code === 200 || res.code === 0) {
        wxUserInfo.value = null
        return { success: true, message: '解绑成功' }
      }
      return { success: false, message: res.msg || '解绑失败' }
    } catch (error) {
      console.error('Failed to unbind wx:', error)
      return { success: false, message: '解绑失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  return {
    bindList,
    currentBindId,
    currentRoles,
    availableRoles,
    loading,
    wxUserInfo,
    fetchBindList,
    createBind,
    fetchRoles,
    syncRoles,
    selectBind,
    fetchAvailableRoles,
    bindRole,
    batchBindRoles,
    removeRole,
    sendBindCode,
    bindWithCode,
    getLatestBindId,
    bindWithWxCode,
    fetchWxBindStatus,
    unbindWx
  }
})
