<template>
  <div class="book-card">
    <div class="book-cover" @click="goToDetail" style="cursor: pointer;">
      <img :src="book.cover_image || '/image/book-icon.png'" 
           :alt="book.title" 
           class="img-fluid"
           @error="handleImageError">
    </div>
    <div class="book-info">
      <h5 class="book-title">{{ book.title }}</h5>
      <p class="book-author">作者：{{ book.author }}</p>
      <p class="book-category" v-if="book.category_name">分类：{{ book.category_name }}</p>
      <div class="book-meta">
        <span class="book-price">¥{{ book.price.toFixed(2) }}</span>
        <span :class="['book-stock', { 'text-danger': book.stock === 0 }]">
          {{ book.stock > 0 ? `库存：${book.stock}` : '缺货' }}
        </span>
      </div>
      <div class="book-actions">
        <button 
          :class="['btn btn-sm', isInCart(book.id) ? 'btn-primary' : 'btn-warning']"
          :disabled="book.stock === 0"
          @click="() => toggleCart(book.id)"
        >
          {{ isInCart(book.id) ? '已在购物车' : '加入购物车' }}
        </button>
        <button 
          class="btn btn-outline-secondary btn-sm"
          @click="() => toggleFavorite(book.id)"
        >
          <i :class="['fas', isInWishlist(book.id) ? 'fa-heart text-danger' : 'fa-heart']"></i>
          {{ isInWishlist(book.id) ? '已收藏' : '收藏' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'
import { useBookStates } from '../composables/useBookStates'

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const userStore = useUserStore()
    
    const {
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite,
      loadUserStates
    } = useBookStates()

    const goToDetail = () => {
      router.push(`/book/${props.book.id}`)
    }

    const addToCart = async () => {
      if (!userStore.userInfo.isLoggedIn) {
        alert('请先登录')
        return
      }

      try {
        const result = await api.addToCart(props.book.id)
        alert(result.message)
      } catch (error) {
        alert('添加到购物车失败：' + error.message)
      }
    }

    const toggleWishlist = async () => {
      if (!userStore.userInfo.isLoggedIn) {
        alert('请先登录')
        return
      }

      try {
        const result = await api.toggleWishlist(props.book.id)
        isInWishlist.value = !isInWishlist.value
        alert(result.message)
      } catch (error) {
        alert('收藏操作失败：' + error.message)
      }
    }

    // 检查收藏状态
    const checkWishlistStatus = async () => {
      if (userStore.userInfo.isLoggedIn) {
        // 这里可以添加检查收藏状态的API调用
        // 暂时设置为false
        isInWishlist.value = false
      }
    }

    onMounted(() => {
      checkWishlistStatus()
    })

    return {
      isInWishlist,
      goToDetail,
      addToCart,
      toggleWishlist
    }
  }
}
</script>

<style scoped>
.book-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.book-cover {
  height: 200px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  padding: 15px;
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.3;
}

.book-author,
.book-category {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.book-price {
  font-size: 18px;
  font-weight: bold;
  color: #dc3545;
}

.book-stock {
  font-size: 14px;
}

.book-actions {
  display: flex;
  gap: 8px;
}

.book-actions .btn {
  flex: 1;
  font-size: 12px;
}
</style>