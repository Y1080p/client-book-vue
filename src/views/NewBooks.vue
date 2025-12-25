<template>
  <div class="new-books">
    <div class="container">
      <h1 class="page-title">新书推荐</h1>
      <div class="books-grid">
        <div v-for="book in books" :key="book.id" class="book-card">
          <div class="book-cover" @click="goToBookDetail(book.id)" style="cursor: pointer;">
            <img :src="getBookCover(book.cover_image)" :alt="book.title"
                 @error="handleImageError">
          </div>
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">作者：{{ book.author }}</p>
          <p class="book-category">分类：{{ book.category_name }}</p>
          <div class="book-meta">
            <span class="book-price">¥{{ formatPrice(book.price) }}</span>
            <span class="book-stock" :class="{ 'book-out-of-stock': book.stock === 0 }">
              {{ book.stock > 0 ? '库存：' + book.stock : '缺货' }}
            </span>
          </div>
          <div class="book-actions">
            <button @click="toggleCart(book.id)" 
                    :class="['btn', isInCart(book.id) ? 'btn-primary' : 'btn-warning']"
                    :disabled="book.stock === 0">
              <i class="fas fa-shopping-cart me-1"></i>
              {{ isInCart(book.id) ? '已在购物车' : '加入购物车' }}
            </button>
            <button @click="toggleFavorite(book.id)" 
                    :class="['btn', isInWishlist(book.id) ? 'btn-danger' : 'btn-secondary']">
              <i :class="['fas me-1', isInWishlist(book.id) ? 'fa-heart' : 'fa-heart-o']"></i>
              {{ isInWishlist(book.id) ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="books.length === 0" class="no-books">
        <h3>暂无新书</h3>
        <p>暂时没有新书推荐，请稍后再来查看。</p>
      </div>
    </div>
    
    <!-- 页尾组件 -->
    <Footer />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useBookStates } from '../composables/useBookStates'
import Footer from '../components/Footer.vue'

export default {
  name: 'NewBooks',
  components: {
    Footer
  },
  setup() {
    const router = useRouter()
    const books = ref([])
    const {
      cartItems,
      wishlistItems,
      loadUserStates,
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite
    } = useBookStates()

    const getBookCover = (coverImage) => {
      if (coverImage && !coverImage.includes('images/')) {
        return `${coverImage.startsWith('/') ? '' : '/'}${coverImage}`
      }
      return '/client-book/image/book-icon.png'
    }

    const handleImageError = (event) => {
      event.target.src = '/client-book/image/book-icon.png'
    }

    const formatPrice = (price) => {
      const numPrice = parseFloat(price)
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
    }

    const loadNewBooks = async () => {
      try {
        const data = await api.getNewBooks()
        books.value = data
      } catch (error) {
        console.error('加载新书失败:', error)
        books.value = []
      }
    }

    const goToBookDetail = (bookId) => {
      router.push(`/book/${bookId}`)
    }

    onMounted(() => {
      loadNewBooks()
      loadUserStates()
    })

    return {
      books,
      cartItems,
      wishlistItems,
      getBookCover,
      handleImageError,
      formatPrice,
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite,
      goToBookDetail
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.book-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.book-cover {
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.book-author, .book-category {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.book-price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.book-stock {
  font-size: 14px;
  color: #28a745;
}

.book-out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}

.book-actions {
  display: flex;
  gap: 10px;
}

.no-books {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>