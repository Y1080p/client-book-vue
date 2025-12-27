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
    console.log('=== USER STORE LOGIN DEBUG ===');
    console.log('Calling API login with:', { username, password: !!password });

    try {
      const data = await api.login(username, password)
      console.log('API login response:', data);

      if (data.success) {
        console.log('Login successful, updating userInfo');
        // 直接使用返回的用户信息
        if (data.user) {
          userInfo.value = {
            isLoggedIn: true,
            id: data.user.id,
            username: data.user.username
          }
          console.log('UserInfo updated from data.user:', userInfo.value);
        } else {
          // 如果没有返回用户信息，尝试检查登录状态
          console.log('No user data returned, checking login status...');
          await checkLoginStatus()
        }
        return { success: true, message: '登录成功' }
      } else {
        console.log('Login failed:', data.message);
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error in store:', error);
      console.error('Error response:', error.response?.data);
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