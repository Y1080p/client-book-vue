<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <i class="fas fa-book text-primary me-2" style="font-size: 28px;"></i>
          <span class="logo-text">图书商城</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/" :class="{ active: $route.name === 'Home' }">首页</router-link>
          <router-link to="/new-books" :class="{ active: $route.name === 'NewBooks' }">新书推荐</router-link>
          <router-link to="/bestsellers" :class="{ active: $route.name === 'Bestsellers' }">畅销排行</router-link>
          <router-link to="/chat-groups" :class="{ active: $route.name === 'ChatGroups' }">书声漫谈</router-link>
        </nav>
        
        <div class="user-info">
          <template v-if="userStore.userInfo.isLoggedIn">
            <span class="welcome-text">欢迎，{{ userStore.userInfo.username }}</span>
            <router-link to="/profile" class="btn btn-secondary">个人中心</router-link>
            <button @click="logout" class="btn btn-secondary">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-primary">登录</router-link>
            <router-link to="/register" class="btn btn-secondary">注册</router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 使用 storeToRefs 保持响应式
    const { userInfo } = storeToRefs(userStore)

    const logout = async () => {
      const result = await userStore.logout()
      if (result.success) {
        router.push('/')
      } else {
        console.error('退出失败:', result.message)
      }
    }

    onMounted(() => {
      userStore.checkLoginStatus()
    })

    return {
      userInfo,
      userStore,
      logout
    }
  }
}
</script>

<style scoped>
.header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 15px 0;
  margin: 15px 0 30px 0;
}

.header-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-left: 30px;
}

.logo-img {
  height: 30px;
  vertical-align: middle;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 25px;
  align-items: center;
}

.nav-menu a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-menu a.active {
  background-color: #007bff;
  color: white;
}

.nav-menu a:hover {
  background-color: #e9ecef;
  color: #007bff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
  margin-right: 5px;
}

.user-info span {
  color: #6c757d;
}

.user-info a:hover {
  color: white;
}

.btn {
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #545b62;
  color: white;
}
</style>