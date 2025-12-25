<template>
  <div class="wishlist-page">
    <div class="container">
      <h2 class="mb-4">我的收藏</h2>
      
      <div v-if="!userStore.userInfo.isLoggedIn" class="not-logged-in">
        <div class="text-center py-5">
          <i class="fas fa-heart fa-3x text-muted mb-3"></i>
          <h4>请先登录</h4>
          <p class="text-muted">登录后查看您的收藏列表</p>
          <router-link to="/login" class="btn btn-primary">登录</router-link>
        </div>
      </div>
      
      <div v-else>
        <div v-if="wishlistItems.length === 0" class="empty-wishlist">
          <div class="text-center py-5">
            <i class="fas fa-heart fa-3x text-muted mb-3"></i>
            <h4>收藏夹为空</h4>
            <p class="text-muted">您还没有收藏任何图书</p>
            <router-link to="/" class="btn btn-primary">去逛逛</router-link>
          </div>
        </div>
        
        <div v-else class="wishlist-items">
          <div class="row">
            <div v-for="item in wishlistItemsWithDetails" :key="item.id" class="col-md-6 col-lg-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="row">
                    <div class="col-4">
                      <img :src="item.book.cover_image || './image/book-icon.png'" 
                           :alt="item.book.title" 
                           class="img-fluid rounded">
                    </div>
                    <div class="col-8">
                      <h6 class="card-title">{{ item.book.title }}</h6>
                      <p class="text-muted small">作者：{{ item.book.author }}</p>
                      <p class="price">¥{{ Number(item.book.price).toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-primary btn-sm" 
                            @click="addToCart(item.book.id)"
                            :disabled="item.book.stock === 0">
                      加入购物车
                    </button>
                    <button class="btn btn-outline-danger btn-sm" 
                            @click="removeFromWishlist(item.book.id)">
                      <i class="fas fa-trash"></i>
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
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useBookStates } from '../composables/useBookStates'
import { api } from '../services/api'

export default {
  name: 'Wishlist',
  setup() {
    const userStore = useUserStore()
    const { wishlistItems, loadUserStates, toggleFavorite } = useBookStates()
    const loading = ref(true)
    const serverWishlistItems = ref([]) // 从服务器获取的完整收藏数据
    
    // 计算属性：获取完整的收藏图书信息
    // 优先使用服务器返回的完整数据，如果没有则使用本地状态
    const wishlistItemsWithDetails = computed(() => {
      // 如果服务器返回了完整数据，直接使用
      if (serverWishlistItems.value.length > 0) {
        return serverWishlistItems.value.map(item => ({
          id: item.id || item.book_id,
          book: {
            id: item.id || item.book_id,
            title: item.title || '未知图书',
            author: item.author || '未知作者',
            price: item.price || 0,
            stock: item.stock || 0,
            cover_image: item.cover_image || './image/book-icon.png'
          }
        }))
      }
      
      // 否则使用本地状态（可能只有book_id）
      return wishlistItems.value.map(item => ({
        id: item.id || item.book_id,
        book: {
          id: item.id || item.book_id,
          title: item.title || '未知图书',
          author: item.author || '未知作者',
          price: item.price || 0,
          stock: item.stock || 0,
          cover_image: item.cover_image || './image/book-icon.png'
        }
      }))
    })

    const fetchWishlist = async () => {
      if (!userStore.userInfo.isLoggedIn) {
        loading.value = false
        return
      }

      try {
        loading.value = true
        
        // 直接从服务器获取完整的收藏数据（像购物车页面一样）
        const wishlistData = await api.getWishlist()
        serverWishlistItems.value = wishlistData.wishlist || []
        
        // 同时更新本地状态
        await loadUserStates()
        

      } catch (error) {
        console.error('获取收藏列表失败:', error)
        // 如果服务器请求失败，回退到本地状态
        await loadUserStates()
      } finally {
        loading.value = false
      }
    }

    const addToCart = async (bookId) => {
      try {
        const result = await api.addToCart(bookId)
        alert(result.message)
      } catch (error) {
        alert('添加到购物车失败：' + error.message)
      }
    }

    const removeFromWishlist = async (bookId) => {
      try {
        // 使用 toggleFavorite 函数来移除收藏
        await toggleFavorite(bookId)
      } catch (error) {
        alert('移除收藏失败：' + error.message)
      }
    }

    onMounted(() => {
      fetchWishlist()
    })

    return {
      userStore,
      wishlistItems,
      wishlistItemsWithDetails,
      loading,
      addToCart,
      removeFromWishlist
    }
  }
}
</script>

<style scoped>
.wishlist-items img {
  max-height: 80px;
  object-fit: cover;
}

.price {
  font-weight: bold;
  color: #dc3545;
}
</style>