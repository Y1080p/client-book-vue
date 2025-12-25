<template>
  <div class="book-detail container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else-if="book" class="row">
      <div class="col-md-4">
        <div class="book-cover">
          <img :src="book.cover_image || '/client-book/image/book-icon.png'" 
               :alt="book.title" 
               class="img-fluid rounded"
               @error="handleImageError">
        </div>
      </div>
      
      <div class="col-md-8">
        <h1 class="book-title">{{ book.title }}</h1>
        <p class="book-author text-muted mb-3">作者：{{ book.author }}</p>
        
        <div class="book-meta mb-4">
          <div class="row">
            <div class="col-md-6">
              <p><strong>分类：</strong>{{ book.category_name }}</p>
              <p><strong>单价：</strong><span class="text-danger fs-4">¥{{ parseFloat(book.price).toFixed(2) }}</span></p>
              <p><strong>库存：</strong>
                <span :class="{'text-danger': book.stock === 0}">
                  {{ book.stock > 0 ? `${book.stock} 本` : '缺货' }}
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>ISBN：</strong>{{ book.isbn || '暂无' }}</p>
              <p><strong>出版社：</strong>{{ book.publisher || '暂无' }}</p>
              <p><strong>购买数量：</strong>
                <input 
                  type="number" 
                  v-model="quantity" 
                  :min="1" 
                  :max="book.stock" 
                  class="form-control d-inline-block" 
                  style="width: 100px;"
                  :disabled="book.stock === 0">
              </p>
              <p><strong>总价：</strong><span class="text-danger fs-4">¥{{ totalPrice.toFixed(2) }}</span></p>
            </div>
          </div>
        </div>
        
        <div class="book-description mb-4">
          <h5>图书简介</h5>
          <p>{{ book.description || '暂无简介' }}</p>
        </div>
        
        <div class="book-actions">
          <button 
            :class="['btn btn-lg me-3', isInCart(book.id) ? 'btn-primary' : 'btn-warning']"
            :disabled="book.stock === 0"
            @click="() => toggleCart(book.id)"
          >
            <i class="fas fa-shopping-cart me-2"></i>
            {{ isInCart(book.id) ? '已在购物车' : '加入购物车' }}
          </button>
          <button 
            class="btn btn-outline-secondary btn-lg me-3"
            @click="() => toggleFavorite(book.id)"
          >
            <i :class="['fas me-2', isInWishlist(book.id) ? 'fa-heart text-danger' : 'fa-heart']"></i>
            {{ isInWishlist(book.id) ? '已收藏' : '收藏' }}
          </button>
          <button 
            class="btn btn-success btn-lg" 
            :disabled="book.stock === 0 || quantity <= 0"
            @click="showPaymentModal"
          >
            <i class="fas fa-credit-card me-2"></i>
            立即购买
          </button>
        </div>

        <!-- 付款模态框 -->
        <div v-if="showPayment" class="modal fade show" style="display: block;" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">确认订单</h5>
                <button type="button" class="btn-close" @click="closePaymentModal"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>商品信息</h6>
                    <div class="d-flex align-items-center mb-3">
                      <img :src="book.cover_image || '/client-book/image/book-icon.png'" 
                           :alt="book.title" 
                           class="img-thumbnail me-3" 
                           style="width: 80px; height: 100px; object-fit: cover;">
                      <div>
                        <p class="mb-1"><strong>{{ book.title }}</strong></p>
                        <p class="text-muted mb-1">作者：{{ book.author }}</p>
                        <p class="mb-0">数量：{{ quantity }} 本</p>
                      </div>
                    </div>
                    <div class="border-top pt-3">
                      <p><strong>总价：</strong><span class="text-danger fs-5">¥{{ totalPrice.toFixed(2) }}</span></p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>收货地址</h6>
                    
                    <!-- 地址选择 -->
                    <div class="mb-3" v-if="userAddresses.length > 0">
                      <label class="form-label">选择地址</label>
                      <select v-model="selectedAddressId" class="form-select" @change="loadSelectedAddress">
                        <option value="">请选择地址</option>
                        <option v-for="address in userAddresses" :key="address.id" :value="address.id">
                          {{ address.name }} - {{ address.phone }} - {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
                          <span v-if="address.is_default">(默认)</span>
                        </option>
                      </select>
                      <div class="mt-2">
                        <router-link to="/addresses" class="btn btn-sm btn-outline-primary">
                          <i class="fas fa-edit me-1"></i>管理地址
                        </router-link>
                      </div>
                    </div>
                    
                    <!-- 手动输入地址 -->
                    <div class="mb-3">
                      <label class="form-label">收货人姓名</label>
                      <input type="text" v-model="addressInfo.name" class="form-control" placeholder="请输入收货人姓名">
                    </div>
                    <div class="mb-3">
                      <label class="form-label">联系电话</label>
                      <input type="tel" v-model="addressInfo.phone" class="form-control" placeholder="请输入联系电话">
                    </div>
                    <div class="row">
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">省份</label>
                          <input type="text" v-model="addressInfo.province" class="form-control" placeholder="省份">
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">城市</label>
                          <input type="text" v-model="addressInfo.city" class="form-control" placeholder="城市">
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label">区县</label>
                          <input type="text" v-model="addressInfo.district" class="form-control" placeholder="区县">
                        </div>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">详细地址</label>
                      <textarea v-model="addressInfo.detail" class="form-control" rows="3" placeholder="请输入详细地址"></textarea>
                    </div>
                    <!-- 地图定位功能已注释
                    <div class="mb-3">
                      <label class="form-label">地图定位</label>
                      <div id="map-container" style="height: 200px; border: 1px solid #ddd; border-radius: 4px;"></div>
                      <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-outline-primary" @click="locateOnMap">
                          <i class="fas fa-map-marker-alt me-1"></i>在地图上定位
                        </button>
                      </div>
                    </div>
                    -->
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closePaymentModal">取消</button>
                <button type="button" class="btn btn-primary" @click="confirmPayment" :disabled="!isAddressValid">确认付款</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 遮罩层 -->
        <div v-if="showPayment" class="modal-backdrop fade show"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'
import { useBookStates } from '../composables/useBookStates'

export default {
  name: 'BookDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    
    const book = ref(null)
    const loading = ref(true)
    const error = ref('')
    const quantity = ref(1)
    const showPayment = ref(false)
    const userAddresses = ref([])
    const selectedAddressId = ref('')
    const addressInfo = ref({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: ''
    })
    
    const {
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite,
      loadUserStates
    } = useBookStates()

    // 地图相关变量
    const mapInstance = ref(null)
    const marker = ref(null)

    // 计算总价
    const totalPrice = ref(0)
    
    // 监听数量和价格变化，重新计算总价
    const updateTotalPrice = () => {
      if (book.value && book.value.price) {
        totalPrice.value = parseFloat(book.value.price) * quantity.value
      }
    }

    // 监听数量变化
    watch(quantity, () => {
      updateTotalPrice()
    })

    // 监听图书数据加载完成
    watch(book, () => {
      if (book.value) {
        updateTotalPrice()
      }
    }, { immediate: true })

    // 验证地址信息是否完整
    const isAddressValid = ref(false)
    
    // 监听地址信息变化
    watch(addressInfo, (newVal) => {
      isAddressValid.value = newVal.name.trim() !== '' && 
                            newVal.phone.trim() !== '' && 
                            newVal.detail.trim() !== ''
    }, { deep: true })

    // 加载用户地址
    const loadUserAddresses = async () => {
      try {
        const data = await api.getUserAddresses()
        if (data.success) {
          userAddresses.value = data.addresses || []
          // 如果有默认地址，自动选择
          const defaultAddress = userAddresses.value.find(addr => addr.is_default)
          if (defaultAddress) {
            selectedAddressId.value = defaultAddress.id
            loadSelectedAddress()
          }
        }
      } catch (error) {
        console.error('加载用户地址失败:', error)
      }
    }

    // 加载选中的地址
    const loadSelectedAddress = () => {
      if (!selectedAddressId.value) {
        // 清空地址信息
        addressInfo.value = {
          name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail: ''
        }
        return
      }
      
      const selectedAddress = userAddresses.value.find(addr => addr.id === selectedAddressId.value)
      if (selectedAddress) {
        addressInfo.value = {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          province: selectedAddress.province,
          city: selectedAddress.city,
          district: selectedAddress.district,
          detail: selectedAddress.detail
        }
      }
    }

    const loadBookDetail = async () => {
      try {
        loading.value = true
        const bookId = route.params.id
        
        // 验证图书ID
        if (!bookId || bookId === 'undefined') {
          error.value = '图书ID无效'
          loading.value = false
          return
        }
        
        const data = await api.getBookDetail(bookId)
        
        if (data.success) {
          book.value = data.book
          // 加载用户状态
          await loadUserStates()
        } else {
          error.value = data.message || '获取图书详情失败'
        }
      } catch (err) {
        console.error('加载图书详情失败:', err)
        error.value = '加载图书详情失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    // 显示付款模态框
    const showPaymentModal = async () => {
      if (!userStore.userInfo.isLoggedIn) {
        alert('请先登录')
        router.push('/login')
        return
      }
      
      if (quantity.value <= 0) {
        alert('请选择购买数量')
        return
      }
      
      if (quantity.value > book.value.stock) {
        alert(`库存不足，当前库存为 ${book.value.stock} 本`)
        return
      }
      
      showPayment.value = true
      
      // 加载用户地址
      await loadUserAddresses()
      
      // 延迟初始化地图，确保DOM已渲染
      setTimeout(() => {
        initMap()
      }, 100)
    }

    // 关闭付款模态框
    const closePaymentModal = () => {
      showPayment.value = false
      // 重置地址信息
      addressInfo.value = {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: ''
      }
      selectedAddressId.value = ''
      userAddresses.value = []
      // 清理地图
      if (mapInstance.value) {
        mapInstance.value.destroy()
        mapInstance.value = null
        marker.value = null
      }
    }

    // 初始化地图
    const initMap = () => {
      const mapKey = import.meta.env.VITE_TENCENT_MAP_KEY
      if (!mapKey) {
        console.warn('腾讯地图密钥未配置')
        // 显示基本地图功能，但不加载SDK
        showBasicMap()
        return
      }

      // 检查是否已加载腾讯地图SDK
      if (window.TMap) {
        createMap()
      } else {
        // 动态加载腾讯地图SDK
        const script = document.createElement('script')
        script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${mapKey}`
        script.onload = () => {
          createMap()
        }
        script.onerror = () => {
          console.warn('腾讯地图SDK加载失败，使用基础地图功能')
          showBasicMap()
        }
        document.head.appendChild(script)
      }
    }

    // 显示基础地图功能
    const showBasicMap = () => {
      const mapContainer = document.getElementById('map-container')
      if (!mapContainer) return
      
      mapContainer.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #666;">
          <div class="text-center">
            <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 10px;"></i>
            <p>地图功能需要有效的腾讯地图密钥</p>
            <p class="small">请检查密钥配置或联系管理员</p>
          </div>
        </div>
      `
    }

    // 创建地图实例
    const createMap = () => {
      try {
        const mapContainer = document.getElementById('map-container')
        if (!mapContainer) return

        // 简化地图配置，使用正确的API调用方式
        mapInstance.value = new TMap.Map(mapContainer, {
          center: new TMap.LatLng(39.908823, 116.397470), // 北京中心点
          zoom: 12
        })

        // 添加点击地图事件
        mapInstance.value.on('click', (evt) => {
          const latLng = evt.latLng
          addMarker(latLng)
          // 反向地理编码获取地址
          reverseGeocode(latLng)
        })
      } catch (error) {
        console.error('地图初始化失败:', error)
        // 如果地图初始化失败，显示基础地图
        showBasicMap()
      }
    }

    // 添加标记点
    const addMarker = (latLng) => {
      try {
        if (marker.value) {
          marker.value.setMap(null)
        }

        // 使用正确的Marker构造函数
        marker.value = new TMap.Marker({
          map: mapInstance.value,
          position: latLng
        })
      } catch (error) {
        console.warn('添加标记点失败:', error)
        // 如果Marker构造函数不可用，使用简单标记
        addSimpleMarker(latLng)
      }
    }

    // 简单标记点实现
    const addSimpleMarker = (latLng) => {
      const mapContainer = document.getElementById('map-container')
      if (!mapContainer) return
      
      // 创建简单的标记元素
      const markerElement = document.createElement('div')
      markerElement.innerHTML = '<i class="fas fa-map-marker-alt" style="color: red; font-size: 24px;"></i>'
      markerElement.style.position = 'absolute'
      markerElement.style.transform = 'translate(-50%, -100%)'
      markerElement.style.zIndex = '1000'
      
      // 这里需要将经纬度转换为像素坐标，简化实现
      // 在实际应用中，应该使用地图的投影转换方法
      
      // 临时解决方案：在中心位置显示标记
      markerElement.style.left = '50%'
      markerElement.style.top = '50%'
      
      mapContainer.appendChild(markerElement)
      
      // 保存标记引用
      marker.value = markerElement
    }

    // 反向地理编码
    const reverseGeocode = (latLng) => {
      try {
        // 检查地理编码服务是否可用
        if (typeof TMap.service === 'undefined' || typeof TMap.service.Geocoder === 'undefined') {
          console.warn('地理编码服务不可用')
          // 使用模拟地址
          addressInfo.value.detail = '广西民族大学（武鸣校区）'
          return
        }
        
        const geocoder = new TMap.service.Geocoder()
        geocoder.reverseGeocode({ location: latLng }, (result, status) => {
          if (status === 'complete' && result.result) {
            const address = result.result.address
            addressInfo.value.detail = address
            console.log('获取到的地址:', address)
          }
        })
      } catch (error) {
        console.warn('反向地理编码失败:', error)
        // 使用模拟地址
        addressInfo.value.detail = '广西民族大学（武鸣校区）'
      }
    }

    // 在地图上定位
    const locateOnMap = () => {
      if (!mapInstance.value) {
        alert('地图功能暂不可用，请手动输入地址')
        return
      }

      // 使用浏览器定位
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mapInstance.value) {
              const latLng = new TMap.LatLng(
                position.coords.latitude,
                position.coords.longitude
              )
              mapInstance.value.setCenter(latLng)
              mapInstance.value.setZoom(15)
              addMarker(latLng)
              reverseGeocode(latLng)
            }
          },
          (error) => {
            console.error('定位失败:', error)
            // 如果定位失败，使用默认位置
            const defaultLatLng = new TMap.LatLng(39.908823, 116.397470)
            mapInstance.value.setCenter(defaultLatLng)
            mapInstance.value.setZoom(12)
            addMarker(defaultLatLng)
            reverseGeocode(defaultLatLng)
            alert('定位失败，已使用默认位置')
          }
        )
      } else {
        alert('您的浏览器不支持定位功能，请手动输入地址')
      }
    }

    // 确认付款
    const confirmPayment = async () => {
      if (!isAddressValid.value) {
        alert('请填写完整的收货地址信息')
        return
      }

      try {
        // 调用购买API创建待支付订单
        const result = await api.purchaseBook(book.value.id, quantity.value, addressInfo.value)
        
        if (result.success) {
          // 跳转到订单确认页面
          router.push(`/orders/${result.order_id}/confirm`)
          closePaymentModal()
        } else {
          alert(result.message || '创建订单失败')
        }
      } catch (error) {
        console.error('购买失败:', error)
        alert('创建订单失败，请稍后重试')
      }
    }

    onMounted(() => {
      loadBookDetail()
    })

    return {
      book,
      loading,
      error,
      quantity,
      totalPrice,
      showPayment,
      userAddresses,
      selectedAddressId,
      addressInfo,
      isAddressValid,
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite,
      showPaymentModal,
      closePaymentModal,
      confirmPayment,
      locateOnMap,
      loadSelectedAddress
    }
  }
}
</script>

<style scoped>
.book-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.book-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.book-author {
  font-size: 1.2rem;
}

.book-cover {
  position: sticky;
  top: 20px;
}

.book-cover img {
  width: 100%;
  height: auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.book-meta {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.book-description {
  line-height: 1.6;
}

.book-actions .btn {
  min-width: 140px;
}

@media (max-width: 768px) {
  .book-title {
    font-size: 1.8rem;
  }
  
  .book-actions .btn {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>