import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getBindList,
  bindAccount,
  getGameRole,
  syncRoleData,
  getAvailableRoles,
  addRole,
  deleteRole
} from '@/api/modules/account'
import type { GameBind, GameRole } from '@/types/models'
import type { BindRequest, BindRoleResult, Role, AddRoleRequest } from '@/types/api'

export const useAccountStore = defineStore('account', () => {

  const bindList = ref<GameBind[]>([])
  const currentBindId = ref<number | null>(null)
  const currentRoles = ref<GameRole[]>([])
  const availableRoles = ref<Role[]>([]) // 游戏账号下的所有可用角色
  const loading = ref(false)

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
          roleName: role.roleName
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

  return {
    bindList,
    currentBindId,
    currentRoles,
    availableRoles,
    loading,
    fetchBindList,
    createBind,
    fetchRoles,
    syncRoles,
    selectBind,
    fetchAvailableRoles,
    bindRole,
    removeRole
  }
})
