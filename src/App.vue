<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import { useUserStore } from './stores/user'

export default {
  name: 'App',
  components: {
    Header
  },
  async created() {
    // 应用启动时检查登录状态
    console.log('=== APP CREATED DEBUG ===');
    console.log('Checking login status...');
    const userStore = useUserStore()
    await userStore.checkLoginStatus()
    console.log('Initial login status:', userStore.userInfo);
    console.log('========================');
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  min-height: calc(100vh - 80px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>