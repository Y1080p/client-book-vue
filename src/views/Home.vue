<template>
  <div class="home">
    <div class="container">
      <!-- 轮播图区域 -->
      <div class="carousel-section">
        <div class="carousel-container">
          <div class="carousel" ref="carousel">
            <div 
              v-for="(slide, index) in carouselSlides" 
              :key="index"
              class="carousel-slide"
              :class="{ 'active': currentSlide === index }"
            >
              <img :src="slide.image" :alt="slide.title" class="carousel-image">
              <div class="carousel-caption">
                <h3>{{ slide.title }}</h3>
                <p>{{ slide.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- 左右控制按钮 -->
          <button class="carousel-control prev" @click="prevSlide">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="carousel-control next" @click="nextSlide">
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <!-- 指示器 -->
          <div class="carousel-indicators">
            <button 
              v-for="(slide, index) in carouselSlides" 
              :key="index"
              :class="{ 'active': currentSlide === index }"
              @click="goToSlide(index)"
            ></button>
          </div>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <form @submit.prevent="searchBooks" class="search-form">
          <div class="row align-items-end">
            <div class="col-md-3">
              <div class="form-group">
                <label for="category_id" class="form-label">分类：</label>
                <select v-model="searchParams.category_id" id="category_id" class="form-select">
                  <option value="">全部分类</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="title" class="form-label">书名：</label>
                <input type="text" v-model="searchParams.title" id="title" class="form-control"
                       placeholder="输入书名关键词">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="author" class="form-label">作者：</label>
                <input type="text" v-model="searchParams.author" id="author" class="form-control"
                       placeholder="输入作者姓名">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group buttons">
                <button type="submit" class="btn btn-primary" style="min-width: 80px;">搜索</button>
                <button type="button" @click="resetSearch" class="btn btn-secondary" style="min-width: 80px; margin-left: 15px;">重置</button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- 搜索结果标题 -->
      <div v-if="hasSearch" class="search-results-title">
        <h3>{{ searchResultsTitle }}</h3>
      </div>

      <!-- 图书网格 -->
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

      <!-- 暂无图书 -->
      <div v-if="books.length === 0" class="no-books">
        <h3>暂无图书</h3>
        <p>没有找到符合条件的图书，请尝试其他搜索条件。</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn btn-outline-primary">首页</button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-outline-primary">上一页</button>
        
        <button v-for="page in visiblePages" :key="page" 
                @click="goToPage(page)" 
                :class="['btn', page === currentPage ? 'btn-primary' : 'btn-outline-primary']">
          {{ page }}
        </button>
        
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-outline-primary">下一页</button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn btn-outline-primary">末页</button>
        
        <span>共 {{ totalCount }} 本图书</span>
        <div class="goto-page">
          <span>跳转到第 </span>
          <input type="number" v-model="gotoPageNum" :min="1" :max="totalPages" class="form-control">
          <span> 页</span>
          <button @click="gotoPage" class="btn btn-secondary">跳转</button>
        </div>
      </div>
    </div>
    
    <!-- 页尾组件 -->
    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { useBookStates } from '../composables/useBookStates'
import Footer from '../components/Footer.vue'

export default {
  name: 'Home',
  components: {
    Footer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 轮播图相关
    const carouselSlides = ref([
      {
        image: '/carousel1.jpg',
        title: '热门图书推荐',
        description: '精选优质图书，满足您的阅读需求'
      },
      {
        image: '/carousel2.jpg',
        title: '新品上市',
        description: '最新图书抢先看，第一时间掌握'
      },
      {
        image: '/carousel3.jpg',
        title: '特价优惠',
        description: '限时特惠，超值图书等你来选'
      },
      {
        image: '/carousel4.jpg',
        title: '经典名著',
        description: '文学经典，传承智慧，启迪心灵'
      },
      {
        image: '/carousel5.jpg',
        title: '畅销榜单',
        description: '热门畅销书籍，读者一致好评'
      }
    ])
    const currentSlide = ref(0)
    const carouselInterval = ref(null)
    
    const books = ref([])
    const categories = ref([])
    const searchParams = ref({
      category_id: '',
      title: '',
      author: ''
    })
    const currentPage = ref(1)
    const totalCount = ref(0)
    const totalPages = ref(0)
    const gotoPageNum = ref(1)
    
    const {
      cartItems,
      wishlistItems,
      loadUserStates,
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite
    } = useBookStates()

    // 计算属性
    const hasSearch = computed(() => {
      return searchParams.value.title || searchParams.value.author || searchParams.value.category_id
    })

    const searchResultsTitle = computed(() => {
      const terms = []
      if (searchParams.value.title) terms.push(`书名：${searchParams.value.title}`)
      if (searchParams.value.author) terms.push(`作者：${searchParams.value.author}`)
      if (searchParams.value.category_id) {
        const category = categories.value.find(cat => cat.id == searchParams.value.category_id)
        if (category) terms.push(`分类：${category.name}`)
      }
      return `搜索结果：${terms.join('，')}`
    })

    const visiblePages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // 方法
    const getBookCover = (coverImage) => {
      if (coverImage && !coverImage.includes('images/')) {
        return `/client-book${coverImage.startsWith('/') ? '' : '/'}${coverImage}`
      }
      return '/image/book-icon.png'
    }

    const handleImageError = (event) => {
      event.target.src = '/image/book-icon.png'
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    const loadCategories = async () => {
      try {
        const data = await api.getCategories()
        categories.value = data
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    const loadBooks = async () => {
      try {
        const params = {
          page: currentPage.value,
          ...searchParams.value
        }
        
        const data = await api.getBooks(params)
        books.value = data.books || []
        totalCount.value = data.total_count || 0
        totalPages.value = data.total_pages || 0
      } catch (error) {
        console.error('加载图书失败:', error)
        books.value = []
      }
    }

    const searchBooks = () => {
      currentPage.value = 1
      loadBooks()
    }

    const resetSearch = () => {
      searchParams.value = {
        category_id: '',
        title: '',
        author: ''
      }
      currentPage.value = 1
      loadBooks()
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadBooks()
      }
    }

    const gotoPage = () => {
      const page = parseInt(gotoPageNum.value)
      if (page >= 1 && page <= totalPages.value) {
        goToPage(page)
      } else {
        alert(`请输入有效的页码（1-${totalPages.value}）`)
        gotoPageNum.value = currentPage.value
      }
    }

    // 轮播图方法
    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
      resetAutoPlay()
    }

    const prevSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + carouselSlides.value.length) % carouselSlides.value.length
      resetAutoPlay()
    }

    const goToSlide = (index) => {
      currentSlide.value = index
      resetAutoPlay()
    }

    const startAutoPlay = () => {
      carouselInterval.value = setInterval(() => {
        nextSlide()
      }, 5000) // 5秒轮播
    }

    const resetAutoPlay = () => {
      if (carouselInterval.value) {
        clearInterval(carouselInterval.value)
      }
      startAutoPlay()
    }

    const goToBookDetail = (bookId) => {
      router.push(`/book/${bookId}`)
    }

    // 监听路由变化
    watch(() => route.query, (newQuery) => {
      if (newQuery.page) {
        currentPage.value = parseInt(newQuery.page) || 1
      }
      loadBooks()
    })

    // 初始化
    onMounted(() => {
      loadCategories()
      loadBooks()
      loadUserStates()
      startAutoPlay() // 启动轮播图自动播放
    })

    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (carouselInterval.value) {
        clearInterval(carouselInterval.value)
      }
    })

    return {
      carouselSlides,
      currentSlide,
      books,
      categories,
      searchParams,
      currentPage,
      totalCount,
      totalPages,
      gotoPageNum,
      cartItems,
      wishlistItems,
      hasSearch,
      searchResultsTitle,
      visiblePages,
      getBookCover,
      handleImageError,
      formatPrice,
      searchBooks,
      resetSearch,
      goToPage,
      gotoPage,
      isInCart,
      isInWishlist,
      toggleCart,
      toggleFavorite,
      goToBookDetail,
      nextSlide,
      prevSlide,
      goToSlide
    }
  }
}
</script>

<style scoped>
.search-area {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-results-title {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-results-title h3 {
  margin: 0;
  color: #333;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.goto-page {
  display: flex;
  align-items: center;
  gap: 5px;
}

.goto-page .form-control {
  width: 80px;
  margin: 0 5px;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
}
/* 轮播图样式 */
.carousel-section {
  margin-bottom: 30px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.carousel {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  padding: 30px 20px 20px;
  text-align: center;
}

.carousel-caption h3 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.carousel-caption p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #333;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-control:hover {
  background: rgba(255,255,255,1);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: -10px;
  left: 35%;
  transform: translate(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-indicators button.active {
  background: white;
  transform: scale(1.2);
}

.carousel-indicators button:hover {
  background: rgba(255,255,255,0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-container {
    height: 300px;
  }
  
  .carousel-caption h3 {
    font-size: 1.5rem;
  }
  
  .carousel-caption p {
    font-size: 1rem;
  }
  
  .carousel-control {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    height: 250px;
  }
  
  .carousel-caption h3 {
    font-size: 1.2rem;
  }
  
  .carousel-caption p {
    font-size: 0.9rem;
  }
  
  .carousel-indicators button {
    width: 8px;
    height: 8px;
  }
}

/* 页尾样式 */
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 30px 0;
  margin-top: 50px;
}

.footer-content {
  text-align: center;
  color: #6c757d;
}

.footer-content p {
  margin: 5px 0;
  font-size: 14px;
}

.footer-content p:first-child {
  font-weight: 500;
  color: #495057;
}</style>