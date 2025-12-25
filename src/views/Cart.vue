<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="mb-4">购物车</h2>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="text-center py-5">
          <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
          <h4>购物车为空</h4>
          <p class="text-muted">快去挑选一些好书吧！</p>
          <router-link to="/" class="btn btn-primary">去购物</router-link>
        </div>
      </div>
      
      <div v-else>
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <div v-else class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item card mb-3">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-2">
                  <img :src="item.cover_image || '/image/book-icon.png'" 
                       :alt="item.title" 
                       class="img-fluid rounded">
                </div>
                <div class="col-md-4">
                  <h5 class="card-title">{{ item.title }}</h5>
                  <p class="text-muted">作者：{{ item.author }}</p>
                </div>
                <div class="col-md-2">
                  <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary" 
                            @click="updateQuantity(item, item.quantity - 1)"
                            :disabled="item.quantity <= 1">
                      -
                    </button>
                    <input type="number" 
                           class="form-control text-center" 
                           v-model.number="item.quantity" 
                           min="1" 
                           :max="item.stock"
                           @change="updateQuantity(item, item.quantity)">
                    <button class="btn btn-outline-secondary" 
                            @click="updateQuantity(item, item.quantity + 1)"
                            :disabled="item.quantity >= item.stock">
                      +
                    </button>
                  </div>
                </div>
                <div class="col-md-2">
                  <span class="price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
                <div class="col-md-2">
                  <button class="btn btn-danger btn-sm" @click="removeFromCart(item)">
                    <i class="fas fa-trash"></i> 删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cart-summary card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h5>总计：¥{{ totalAmount.toFixed(2) }}</h5>
                <p class="text-muted">共 {{ totalQuantity }} 件商品</p>
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-primary btn-lg" @click="checkout">
                  结算
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'

export default {
  name: 'Cart',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    
    const cartItems = ref([])
    const loading = ref(true)
    const error = ref('')
    
    const totalQuantity = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
    })
    
    const totalAmount = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
    
    const loadCart = async () => {
      try {
        loading.value = true
        const data = await api.getCart()
        cartItems.value = data.cart || []
      } catch (err) {
        console.error('加载购物车失败:', err)
        error.value = '加载购物车失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    const updateQuantity = async (item, newQuantity) => {
      if (newQuantity < 1) newQuantity = 1
      if (newQuantity > item.stock) newQuantity = item.stock
      
      try {
        const result = await api.updateCartQuantity(item.book_id, newQuantity)
        if (result.success) {
          item.quantity = newQuantity
        } else {
          alert(result.message || '更新数量失败')
        }
      } catch (err) {
        alert('更新数量失败：' + err.message)
      }
    }
    
    const removeFromCart = async (item) => {
      if (!confirm('确定要从购物车中移除这本书吗？')) {
        return
      }
      
      try {
        const result = await api.removeFromCart(item.book_id)
        if (result.success) {
          const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
          if (index !== -1) {
            cartItems.value.splice(index, 1)
          }
        } else {
          alert(result.message || '移除失败')
        }
      } catch (err) {
        alert('移除失败：' + err.message)
      }
    }
    
    const checkout = () => {
      if (!userStore.userInfo.isLoggedIn) {
        alert('请先登录')
        router.push('/login')
        return
      }
      
      if (cartItems.value.length === 0) {
        alert('购物车为空')
        return
      }
      
      alert('结算功能开发中...')
    }
    
    onMounted(() => {
      if (userStore.userInfo.isLoggedIn) {
        loadCart()
      } else {
        loading.value = false
      }
    })
    
    return {
      cartItems,
      loading,
      error,
      totalQuantity,
      totalAmount,
      updateQuantity,
      removeFromCart,
      checkout
    }
  }
}
</script>

<style scoped>
.cart-item img {
  max-height: 100px;
  object-fit: cover;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #dc3545;
}

.input-group {
  max-width: 120px;
}

.cart-summary {
  background: #f8f9fa;
}
</style>