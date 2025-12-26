import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoggedIn = ref(false)

  const checkAuthStatus = async () => {
    try {
      const response = await api.checkLoginStatus()
      if (response.success) {
        user.value = {
          username: response.username
        }
        isLoggedIn.value = true
      } else {
        user.value = null
        isLoggedIn.value = false
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      user.value = null
      isLoggedIn.value = false
    }
  }

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password)
      if (response.success) {
        // 直接使用返回的用户信息
        if (response.user) {
          user.value = {
            username: response.user.username
          }
          isLoggedIn.value = true
        } else {
          // 如果没有返回用户信息，尝试检查登录状态
          await checkAuthStatus()
        }
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      user.value = null
      isLoggedIn.value = false
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.register(username, email, password)
      return response
    } catch (error) {
      throw error
    }
  }

  // 初始化时检查登录状态
  checkAuthStatus()

  return {
    user,
    isLoggedIn,
    checkAuthStatus,
    login,
    logout,
    register
  }
})