<template>
  <div class="register">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="register-card">
            <h2 class="text-center mb-4">用户注册</h2>
            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="username" class="form-label">用户名</label>
                <input type="text" class="form-control" id="username" v-model="form.username" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">邮箱</label>
                <input type="email" class="form-control" id="email" v-model="form.email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">密码</label>
                <input type="password" class="form-control" id="password" v-model="form.password" required>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">确认密码</label>
                <input type="password" class="form-control" id="confirmPassword" v-model="form.confirmPassword" required>
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                {{ loading ? '注册中...' : '注册' }}
              </button>
            </form>
            <div class="text-center mt-3">
              <router-link to="/login">已有账号？立即登录</router-link>
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
import { api } from '../services/api'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const form = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    const loading = ref(false)

    const register = async () => {
      if (form.value.password !== form.value.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      loading.value = true
      try {
        const data = await api.register(
          form.value.username,
          form.value.email,
          form.value.password
        )
        
        if (data.success) {
          alert('注册成功，请登录')
          router.push('/login')
        } else {
          alert('注册失败：' + data.message)
        }
      } catch (error) {
        console.error('注册失败:', error)
        alert('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      register
    }
  }
}
</script>

<style scoped>
.register {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.register-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.register-card h2 {
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