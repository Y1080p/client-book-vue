import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    isLoggedIn: false,
    id: null,
    username: ''
  })

  const checkLoginStatus = async () => {
    try {
      const data = await api.checkLoginStatus()
      if (data.success) {
        userInfo.value = {
          isLoggedIn: true,
          id: data.id,
          username: data.username
        }
      } else {
        userInfo.value = {
          isLoggedIn: false,
          id: null,
          username: ''
        }
      }
    } catch (error) {
      userInfo.value = {
        isLoggedIn: false,
        id: null,
        username: ''
      }
    }
  }

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password)
      if (data.success) {
        // 登录后重新获取用户信息，包括ID
        await checkLoginStatus()
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: '登录失败，请检查网络连接' }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      userInfo.value = {
        isLoggedIn: false,
        username: ''
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: '退出失败' }
    }
  }

  return {
    userInfo,
    checkLoginStatus,
    login,
    logout
  }
})