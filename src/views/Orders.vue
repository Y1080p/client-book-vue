<template>
  <div class="orders container py-4">
    <h2 class="mb-4">我的订单</h2>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">暂无订单</h4>
        <p class="text-muted">您还没有任何订单</p>
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-book me-2"></i>去逛逛
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <div class="row">
        <div class="col-md-3">
          <div class="nav flex-column nav-pills">
            <a class="nav-link" 
               :class="{ active: statusFilter === 'all' }" 
               href="#" 
               @click.prevent="statusFilter = 'all'">
              全部订单
            </a>
            <a class="nav-link" 
               :class="{ active: statusFilter === 'pending' }" 
               href="#" 
               @click.prevent="statusFilter = 'pending'">
              待付款
            </a>
            <a class="nav-link" 
               :class="{ active: statusFilter === 'paid' }" 
               href="#" 
               @click.prevent="statusFilter = 'paid'">
              已付款
            </a>
            <a class="nav-link" 
               :class="{ active: statusFilter === 'shipped' }" 
               href="#" 
               @click.prevent="statusFilter = 'shipped'">
              已发货
            </a>
            <a class="nav-link" 
               :class="{ active: statusFilter === 'completed' }" 
               href="#" 
               @click.prevent="statusFilter = 'completed'">
              已完成
            </a>
          </div>
        </div>
        
        <div class="col-md-9">
          <div class="order-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card mb-4">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <span class="order-id">订单号：{{ order.order_no }}</span>
                    <span class="order-date ms-3 text-muted">{{ order.create_time }}</span>
                  </div>
                  <div>
                    <span class="badge" :class="getStatusBadgeClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="row" v-for="item in order.items" :key="item.id">
                    <div class="col-md-8">
                      <div class="d-flex align-items-center">
                        <img :src="item.cover_image || '/image/book-icon.png'" 
                             :alt="item.title" 
                             class="order-book-cover me-3">
                        <div>
                          <h6 class="mb-1">{{ item.title }}</h6>
                          <p class="text-muted mb-0">作者：{{ item.author }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4 text-end">
                      <p class="mb-1">单价：¥{{ parseFloat(item.price).toFixed(2) }}</p>
                      <p class="mb-1">数量：{{ item.quantity }}</p>
                      <p class="mb-1 fw-bold">小计：¥{{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
                <div class="card-footer d-flex justify-content-between align-items-center">
                  <div class="total-amount">
                    总计：<span class="text-danger fw-bold fs-5">¥{{ parseFloat(order.total_amount).toFixed(2) }}</span>
                  </div>
                  <div class="order-actions">
                    <button class="btn btn-outline-secondary btn-sm me-2" @click="viewOrderDetail(order.id)">
                      查看详情
                    </button>
                    <button v-if="order.status === 'pending'" 
                            class="btn btn-primary btn-sm me-2" 
                            @click="payOrder(order.id)">
                      立即付款
                    </button>
                    <button v-if="order.status === 'pending'" 
                            class="btn btn-outline-danger btn-sm" 
                            @click="cancelOrder(order.id)">
                      取消订单
                    </button>
                    <button v-if="order.status === 'shipped'" 
                            class="btn btn-success btn-sm" 
                            @click="confirmReceipt(order.id)">
                      确认收货
                    </button>
                  </div>
                </div>
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
  name: 'Orders',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const orders = ref([])
    const loading = ref(true)
    const error = ref('')
    const statusFilter = ref('all')

    const filteredOrders = computed(() => {
      if (statusFilter.value === 'all') {
        return orders.value
      }
      return orders.value.filter(order => order.status === statusFilter.value)
    })

    const loadOrders = async () => {
      try {
        loading.value = true
        const data = await api.getOrders()
        orders.value = data.orders || []
      } catch (err) {
        console.error('加载订单失败:', err)
        error.value = '加载订单失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    }

    const getStatusBadgeClass = (status) => {
      const classMap = {
        'pending': 'bg-warning',
        'paid': 'bg-info',
        'shipped': 'bg-primary',
        'completed': 'bg-success',
        'cancelled': 'bg-secondary'
      }
      return classMap[status] || 'bg-secondary'
    }

    const viewOrderDetail = (orderId) => {
      router.push(`/orders/${orderId}`)
    }

    const payOrder = async (orderId) => {
      try {
        const result = await api.payOrder(orderId)
        alert(result.message)
        loadOrders()
      } catch (error) {
        alert('付款失败：' + error.message)
      }
    }

    const cancelOrder = async (orderId) => {
      if (!confirm('确定要取消这个订单吗？')) {
        return
      }
      
      try {
        const result = await api.cancelOrder(orderId)
        alert(result.message)
        loadOrders()
      } catch (error) {
        alert('取消订单失败：' + error.message)
      }
    }

    const confirmReceipt = async (orderId) => {
      if (!confirm('确定已收到商品吗？')) {
        return
      }
      
      try {
        const result = await api.confirmReceipt(orderId)
        alert(result.message)
        loadOrders()
      } catch (error) {
        alert('确认收货失败：' + error.message)
      }
    }

    onMounted(() => {
      if (!userStore.userInfo.isLoggedIn) {
        router.push('/login')
        return
      }
      loadOrders()
    })

    return {
      orders,
      loading,
      error,
      statusFilter,
      filteredOrders,
      getStatusText,
      getStatusBadgeClass,
      viewOrderDetail,
      payOrder,
      cancelOrder,
      confirmReceipt
    }
  }
}
</script>

<style scoped>
.orders {
  max-width: 1200px;
  margin: 0 auto;
}

.order-book-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.order-card .card {
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease;
}

.order-card .card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-date {
  font-size: 0.9rem;
}

.total-amount {
  font-size: 1.1rem;
}

.order-actions .btn {
  min-width: 80px;
}

.nav-pills .nav-link {
  color: #666;
  margin-bottom: 5px;
  border-radius: 6px;
}

.nav-pills .nav-link.active {
  background-color: #007bff;
}

.empty-state {
  padding: 60px 0;
}

@media (max-width: 768px) {
  .order-book-cover {
    width: 40px;
    height: 50px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .order-actions {
    margin-top: 10px;
    width: 100%;
  }
  
  .order-actions .btn {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>