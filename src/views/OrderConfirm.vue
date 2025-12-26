<template>
  <div class="order-confirm container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="order" class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">订单确认</h5>
          </div>
          <div class="card-body">
            <!-- 订单基本信息 -->
            <div class="row mb-4">
              <div class="col-md-6">
                <p><strong>订单号：</strong>{{ order.order_no }}</p>
                <p><strong>下单时间：</strong>{{ formatDate(order.create_time) }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>订单状态：</strong><span class="badge bg-warning">待支付</span></p>
                <p><strong>商品数量：</strong>{{ order.items ? order.items.length : 0 }} 件</p>
                <p><strong>订单金额：</strong><span class="text-danger fw-bold fs-5">¥{{ parseFloat(order.total_amount).toFixed(2) }}</span></p>
              </div>
            </div>
            
            <!-- 收货地址 -->
            <div class="mb-4">
              <h6>收货信息</h6>
              <div class="border rounded p-3 bg-light">
                <template v-if="order.receiver_name || order.province">
                  <p class="mb-1"><strong>{{ order.receiver_name || '未设置收货人' }}</strong></p>
                  <p class="mb-1">电话：{{ order.receiver_phone || '未设置电话' }}</p>
                  <p class="mb-0">地址：{{ getFullAddress(order) }}</p>
                </template>
                <template v-else>
                  <p class="mb-0 text-muted"><i class="bi bi-exclamation-triangle me-2"></i>该订单未设置收货地址</p>
                </template>
              </div>
            </div>
            
            <!-- 商品列表 -->
            <div class="mb-4">
              <h6>商品信息</h6>
              <div v-for="item in order.items" :key="item.id" class="border rounded p-3 mb-2">
                <div class="d-flex align-items-center">
                  <img :src="item.cover_image || '/image/book-icon.png'" 
                       :alt="item.title" 
                       class="img-thumbnail me-3" 
                       style="width: 60px; height: 80px; object-fit: cover;">
                  <div class="flex-grow-1">
                    <p class="mb-1 fw-bold">{{ item.title }}</p>
                    <p class="mb-1 text-muted">作者：{{ item.author }}</p>
                    <p class="mb-0">数量：{{ item.quantity }} 本 × ¥{{ parseFloat(item.price).toFixed(2) }}</p>
                  </div>
                  <div class="text-end">
                    <p class="mb-0 fw-bold">¥{{ parseFloat(item.price * item.quantity).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <!-- 订单操作 -->
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">订单操作</h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="payOrder(order.id)">
                立即支付
              </button>
              <button class="btn btn-outline-danger" @click="cancelOrder(order.id)">
                取消订单
              </button>
              <button class="btn btn-outline-secondary" @click="goToOrders">
                返回订单列表
              </button>
            </div>
          </div>
        </div>
        
        <!-- 订单金额汇总 -->
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">金额明细</h6>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>商品总价：</span>
              <span>¥{{ parseFloat(order.total_amount).toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>运费：</span>
              <span>¥0.00</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between fw-bold fs-5">
              <span>实付金额：</span>
              <span class="text-danger">¥{{ parseFloat(order.total_amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'

export default {
  name: 'OrderConfirm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    
    const order = ref(null)
    const loading = ref(true)
    const error = ref('')

    const loadOrderDetail = async () => {
      try {
        loading.value = true
        const orderId = route.params.id
        
        if (!orderId) {
          error.value = '订单ID无效'
          loading.value = false
          return
        }
        
        const data = await api.getOrderDetail(orderId)
        
        if (data.success) {
          order.value = data.order
        } else {
          error.value = data.message || '获取订单详情失败'
        }
      } catch (err) {
        console.error('加载订单详情失败:', err)
        error.value = '加载订单详情失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    const getFullAddress = (order) => {
      if (!order) return ''
      
      const { province, city, district, detail_address, detail } = order
      const addressParts = [province, city, district, detail_address || detail]
      return addressParts.filter(part => part && part.trim() !== '').join('')
    }

    const payOrder = async (orderId) => {
      try {
        const result = await api.payOrder(orderId)
        alert(result.message)
        // 跳转到订单详情页面
        router.push(`/orders/${orderId}`)
      } catch (error) {
        alert('付款失败：' + error.message)
      }
    }

    const cancelOrder = async (orderId) => {
      if (!confirm('确定要取消订单吗？取消后订单将无法恢复。')) {
        return
      }
      
      try {
        const result = await api.cancelOrder(orderId)
        alert(result.message)
        // 跳转到订单列表
        router.push('/orders')
      } catch (error) {
        alert('取消订单失败：' + error.message)
      }
    }

    const goToOrders = () => {
      router.push('/orders')
    }

    onMounted(() => {
      if (!userStore.userInfo.isLoggedIn) {
        router.push('/login')
        return
      }
      loadOrderDetail()
    })

    return {
      order,
      loading,
      error,
      formatDate,
      getFullAddress,
      payOrder,
      cancelOrder,
      goToOrders
    }
  }
}
</script>

<style scoped>
.order-confirm {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.img-thumbnail {
  border: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .order-confirm {
    padding: 1rem;
  }
  
  .d-flex {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .img-thumbnail {
    margin-bottom: 1rem;
  }
}
</style>