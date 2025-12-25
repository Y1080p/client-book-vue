<template>
  <div class="login">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="login-card">
            <h2 class="text-center mb-4">用户登录</h2>
            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input type="text" class="form-control" id="username" v-model="form.username" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input type="password" class="form-control" id="password" v-model="form.password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                {{ loading ? '登录中...' : '登录' }}
              </button>
            </form>
            <div class="text-center mt-3">
              <router-link to="/register">还没有账号？立即注册</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const form = ref({
      username: '',
      password: ''
    })
    const loading = ref(false)

    const login = async () => {
      loading.value = true
      try {
        const result = await userStore.login(form.value.username, form.value.password)
        if (result.success) {
          alert('登录成功')
          router.push('/')
        } else {
          alert('登录失败：' + (result.message || '未知错误'))
        }
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      login
    }
  }
}
</script>

<style scoped>
.login {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.login-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.login-card h2 {
  color: #333;
  font-weight: bold;
}

.form-label {
  font-weight: 500;
  color: #333;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  padding: 10px;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>