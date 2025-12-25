<template>
  <div class="addresses">
    <div class="container">
      <h1 class="page-title">我的地址</h1>
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
              <router-link to="/profile" class="nav-item">个人信息</router-link>
              <router-link to="/addresses" class="nav-item active">我的地址</router-link>
              <router-link to="/orders" class="nav-item">我的订单</router-link>
              <router-link to="/wishlist" class="nav-item">我的收藏</router-link>
              <router-link to="/cart" class="nav-item">购物车</router-link>
            </nav>
          </div>
        </div>
        <div class="col-md-8">
          <div class="profile-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2>地址管理</h2>
              <button class="btn btn-primary" @click="showAddForm = true">
                <i class="fas fa-plus me-2"></i>新增地址
              </button>
            </div>

            <!-- 地址列表 -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
            </div>

            <div v-else-if="addresses.length === 0" class="text-center py-5">
              <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">暂无地址</h4>
              <p class="text-muted">您还没有添加任何收货地址</p>
              <button class="btn btn-primary" @click="showAddForm = true">
                <i class="fas fa-plus me-2"></i>添加地址
              </button>
            </div>

            <div v-else class="address-list">
              <div v-for="address in addresses" :key="address.id" class="address-card mb-3">
                <div class="card">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 class="card-title">
                          {{ address.name }}
                          <span v-if="address.is_default" class="badge bg-primary ms-2">默认</span>
                        </h5>
                        <p class="card-text mb-1">
                          <i class="fas fa-phone me-2 text-muted"></i>{{ address.phone }}
                        </p>
                        <p class="card-text">
                          <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                          {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
                        </p>
                      </div>
                      <div class="btn-group">
                        <button 
                          v-if="!address.is_default" 
                          class="btn btn-outline-primary btn-sm"
                          @click="setDefaultAddress(address.id)"
                        >
                          设为默认
                        </button>
                        <button 
                          class="btn btn-outline-secondary btn-sm"
                          @click="editAddress(address)"
                        >
                          编辑
                        </button>
                        <button 
                          class="btn btn-outline-danger btn-sm"
                          @click="deleteAddress(address.id)"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加/编辑地址模态框 -->
            <div v-if="showAddForm || showEditForm" class="modal fade show" style="display: block;" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">{{ showEditForm ? '编辑地址' : '新增地址' }}</h5>
                    <button type="button" class="btn-close" @click="closeForm"></button>
                  </div>
                  <div class="modal-body">
                    <form @submit.prevent="saveAddress">
                      <div class="mb-3">
                        <label class="form-label">收货人姓名</label>
                        <input 
                          type="text" 
                          v-model="formData.name" 
                          class="form-control" 
                          placeholder="请输入收货人姓名"
                          required
                        >
                      </div>
                      <div class="mb-3">
                        <label class="form-label">联系电话</label>
                        <input 
                          type="tel" 
                          v-model="formData.phone" 
                          class="form-control" 
                          placeholder="请输入联系电话"
                          required
                        >
                      </div>
                      <div class="row">
                        <div class="col-md-4">
                          <div class="mb-3">
                            <label class="form-label">省份</label>
                            <input 
                              type="text" 
                              v-model="formData.province" 
                              class="form-control" 
                              placeholder="省份"
                              required
                            >
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="mb-3">
                            <label class="form-label">城市</label>
                            <input 
                              type="text" 
                              v-model="formData.city" 
                              class="form-control" 
                              placeholder="城市"
                              required
                            >
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="mb-3">
                            <label class="form-label">区县</label>
                            <input 
                              type="text" 
                              v-model="formData.district" 
                              class="form-control" 
                              placeholder="区县"
                              required
                            >
                          </div>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">详细地址</label>
                        <textarea 
                          v-model="formData.detail" 
                          class="form-control" 
                          rows="3" 
                          placeholder="请输入详细地址"
                          required
                        ></textarea>
                      </div>
                      <div class="mb-3">
                        <div class="form-check">
                          <input 
                            type="checkbox" 
                            v-model="formData.is_default" 
                            class="form-check-input" 
                            id="defaultAddress"
                          >
                          <label class="form-check-label" for="defaultAddress">设为默认地址</label>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeForm">取消</button>
                    <button type="button" class="btn btn-primary" @click="saveAddress">保存</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 遮罩层 -->
            <div v-if="showAddForm || showEditForm" class="modal-backdrop fade show"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'

export default {
  name: 'Addresses',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const addresses = ref([])
    const userInfo = ref({
      username: '',
      email: ''
    })
    const loading = ref(true)
    const showAddForm = ref(false)
    const showEditForm = ref(false)
    const formData = ref({
      id: null,
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      is_default: false
    })

    const loadUserInfo = async () => {
      try {
        const data = await api.getUserProfile()
        userInfo.value = data
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }

    const loadAddresses = async () => {
      try {
        loading.value = true
        const data = await api.getUserAddresses()
        if (data.success) {
          addresses.value = data.addresses || []
        } else {
          console.error('加载地址列表失败:', data.message)
        }
      } catch (error) {
        console.error('加载地址列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const saveAddress = async () => {
      try {
        if (!formData.value.name || !formData.value.phone || !formData.value.province || !formData.value.city || !formData.value.district || !formData.value.detail) {
          alert('请填写完整的地址信息')
          return
        }

        console.log('发送的地址数据:', JSON.stringify(formData.value))
        
        let result
        if (showEditForm.value) {
          result = await api.updateAddress(formData.value.id, formData.value)
        } else {
          result = await api.addAddress(formData.value)
        }

        if (result.success) {
          alert('保存成功')
          closeForm()
          await loadAddresses()
        } else {
          alert(result.message || '保存失败')
        }
      } catch (error) {
        console.error('保存地址失败:', error)
        alert('保存失败，请稍后重试')
      }
    }

    const editAddress = (address) => {
      formData.value = { ...address }
      showEditForm.value = true
    }

    const deleteAddress = async (addressId) => {
      if (!confirm('确定要删除这个地址吗？')) {
        return
      }

      try {
        const result = await api.deleteAddress(addressId)
        if (result.success) {
          alert('删除成功')
          await loadAddresses()
        } else {
          alert(result.message || '删除失败')
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        alert('删除失败，请稍后重试')
      }
    }

    const setDefaultAddress = async (addressId) => {
      try {
        const result = await api.setDefaultAddress(addressId)
        if (result.success) {
          alert('设置成功')
          await loadAddresses()
        } else {
          alert(result.message || '设置失败')
        }
      } catch (error) {
        console.error('设置默认地址失败:', error)
        alert('设置失败，请稍后重试')
      }
    }

    const closeForm = () => {
      showAddForm.value = false
      showEditForm.value = false
      formData.value = {
        id: null,
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        is_default: false
      }
    }

    onMounted(() => {
      if (!userStore.userInfo.isLoggedIn) {
        router.push('/login')
        return
      }
      
      loadUserInfo()
      loadAddresses()
    })

    return {
      addresses,
      userInfo,
      loading,
      showAddForm,
      showEditForm,
      formData,
      loadAddresses,
      saveAddress,
      editAddress,
      deleteAddress,
      setDefaultAddress,
      closeForm
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

.address-card {
  transition: transform 0.2s ease;
}

.address-card:hover {
  transform: translateY(-2px);
}

.btn-group .btn {
  margin-left: 5px;
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
  
  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
  }
  
  .btn-group .btn {
    margin-left: 0;
  }
}
</style>