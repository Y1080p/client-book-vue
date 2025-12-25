<template>
  <div class="profile">
    <div class="container">
      <h1 class="page-title">个人中心</h1>
      <div class="row">
        <div class="col-md-4">
          <div class="profile-sidebar">
            <div class="user-info">
              <div class="avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <h3>{{ userInfo.username }}</h3>
              <p>{{ userInfo.email }}</p>
            </div>
            <nav class="profile-nav">
              <router-link to="/profile" class="nav-item active">个人信息</router-link>
              <router-link to="/addresses" class="nav-item">我的地址</router-link>
              <router-link to="/orders" class="nav-item">我的订单</router-link>
              <router-link to="/wishlist" class="nav-item">我的收藏</router-link>
              <router-link to="/cart" class="nav-item">购物车</router-link>
            </nav>
          </div>
        </div>
        <div class="col-md-8">
          <div class="profile-content">
            <h2>个人信息</h2>
            <div class="info-item">
              <label>用户名：</label>
              <span>{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ formatDate(userInfo.create_time) }}</span>
            </div>
            <div class="action-buttons">
              <button class="btn btn-outline-primary me-2" @click="openEditModal">修改信息</button>
              <button class="btn btn-outline-primary" @click="openPasswordModal">修改密码</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改信息模态框 -->
    <div v-if="showEditModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">修改个人信息</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="editUsername" class="form-label">用户名</label>
              <input type="text" class="form-control" id="editUsername" v-model="editForm.username">
            </div>
            <div class="mb-3">
              <label for="editEmail" class="form-label">邮箱</label>
              <input type="email" class="form-control" id="editEmail" v-model="editForm.email">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">取消</button>
            <button type="button" class="btn btn-primary" @click="saveProfile">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ passwordStep === 1 ? '验证当前密码' : '设置新密码' }}</h5>
            <button type="button" class="btn-close" @click="closePasswordModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="passwordStep === 1" class="mb-3">
              <label for="currentPassword" class="form-label">当前密码</label>
              <input type="password" class="form-control" id="currentPassword" v-model="passwordForm.currentPassword">
            </div>
            <div v-else>
              <div class="mb-3">
                <label for="newPassword" class="form-label">新密码</label>
                <input type="password" class="form-control" id="newPassword" v-model="passwordForm.newPassword">
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">确认密码</label>
                <input type="password" class="form-control" id="confirmPassword" v-model="passwordForm.confirmPassword">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closePasswordModal">取消</button>
            <button v-if="passwordStep === 1" type="button" class="btn btn-primary" @click="verifyCurrentPassword">下一步</button>
            <button v-else type="button" class="btn btn-primary" @click="updatePassword">确认修改</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模态框背景遮罩 -->
    <div v-if="showEditModal || showPasswordModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

export default {
  name: 'Profile',
  setup() {
    const userInfo = ref({
      username: '',
      email: '',
      create_time: ''
    })
    
    const showEditModal = ref(false)
    const showPasswordModal = ref(false)
    const passwordStep = ref(1)
    
    const editForm = ref({
      username: '',
      email: ''
    })
    
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const loadUserInfo = async () => {
      try {
        const data = await api.getUserProfile()
        userInfo.value = data
        // 初始化编辑表单
        editForm.value.username = data.username
        editForm.value.email = data.email
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('zh-CN')
    }

    const openEditModal = () => {
      showEditModal.value = true
      editForm.value.username = userInfo.value.username
      editForm.value.email = userInfo.value.email
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editForm.value.username = userInfo.value.username
      editForm.value.email = userInfo.value.email
    }

    const saveProfile = async () => {
      try {
        const result = await api.updateProfile(editForm.value)
        if (result.success) {
          userInfo.value = { ...userInfo.value, ...editForm.value }
          alert('修改成功！')
          closeEditModal()
        } else {
          alert(result.message || '修改失败')
        }
      } catch (error) {
        console.error('修改信息失败:', error)
        alert('修改失败，请稍后重试')
      }
    }

    const openPasswordModal = () => {
      showPasswordModal.value = true
      passwordStep.value = 1
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }

    const closePasswordModal = () => {
      showPasswordModal.value = false
      passwordStep.value = 1
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }

    const verifyCurrentPassword = async () => {
      if (!passwordForm.value.currentPassword) {
        alert('请输入当前密码')
        return
      }

      try {
        // 验证当前密码是否正确
        const result = await api.verifyCurrentPassword(passwordForm.value.currentPassword)
        
        if (result.success) {
          // 密码正确，进入下一步
          passwordStep.value = 2
        } else {
          // 密码错误，显示错误信息
          alert(result.message || '当前密码错误')
        }
      } catch (error) {
        console.error('验证密码失败:', error)
        alert('验证失败，请稍后重试')
      }
    }

    const updatePassword = async () => {
      if (!passwordForm.value.newPassword) {
        alert('请输入新密码')
        return
      }

      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }



      try {
        const result = await api.updatePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        if (result.success) {
          alert(result.message || '密码修改成功！')
          closePasswordModal()
          // 修改密码成功后刷新页面，强制重新登录
          window.location.reload()
        } else {
          alert(result.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        alert('修改失败，请稍后重试')
      }
    }

    onMounted(() => {
      loadUserInfo()
    })

    return {
      userInfo,
      showEditModal,
      showPasswordModal,
      passwordStep,
      editForm,
      passwordForm,
      formatDate,
      openEditModal,
      closeEditModal,
      saveProfile,
      openPasswordModal,
      closePasswordModal,
      verifyCurrentPassword,
      updatePassword
    }
  }
}
</script>

<style scoped>
.page-title {
  text-align: center;
  margin: 30px 0;
  color: #333;
}

.profile-sidebar {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.user-info {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  font-size: 60px;
  color: #007bff;
  margin-bottom: 15px;
}

.user-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.user-info p {
  margin: 0;
  color: #666;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  padding: 12px 20px;
  text-decoration: none;
  color: #333;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.nav-item:hover, .nav-item.active {
  background-color: #007bff;
  color: white;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.profile-content h2 {
  margin-bottom: 20px;
  color: #333;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.info-item label {
  font-weight: bold;
  width: 100px;
  color: #333;
}

.info-item span {
  color: #666;
}

@media (max-width: 768px) {
  .profile-sidebar {
    margin-bottom: 20px;
  }
  
  .profile-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0;
  }
  
  .nav-item {
    white-space: nowrap;
    padding: 10px 15px;
  }
}
</style>