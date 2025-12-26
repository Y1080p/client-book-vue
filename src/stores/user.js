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
        // 直接使用返回的用户信息
        if (data.user) {
          userInfo.value = {
            isLoggedIn: true,
            id: data.user.id,
            username: data.user.username
          }
        } else {
          // 如果没有返回用户信息，尝试检查登录状态
          await checkLoginStatus()
        }
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