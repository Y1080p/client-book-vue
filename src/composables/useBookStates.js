import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'

export function useBookStates() {
  const router = useRouter()
  const userStore = useUserStore()
  
  // 从 localStorage 初始化购物车和收藏状态
  const getInitialCartState = () => {
    try {
      const saved = localStorage.getItem('cartItems')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }
  
  const getInitialWishlistState = () => {
    try {
      const saved = localStorage.getItem('wishlistItems')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }
  
  const cartItems = ref(getInitialCartState())
  const wishlistItems = ref(getInitialWishlistState())

  // 监听购物车状态变化并保存到 localStorage
  watch(cartItems, (newCartItems) => {
    localStorage.setItem('cartItems', JSON.stringify(newCartItems))
  }, { deep: true })

  // 监听收藏状态变化并保存到 localStorage
  watch(wishlistItems, (newWishlistItems) => {
    localStorage.setItem('wishlistItems', JSON.stringify(newWishlistItems))
  }, { deep: true })

  // 监听用户登录状态变化
  watch(() => userStore.userInfo.isLoggedIn, async (isLoggedIn) => {
    if (isLoggedIn) {
      // 用户登录时从服务器加载购物车和收藏状态
      await loadUserStates()
    } else {
      // 用户登出时清空购物车和收藏状态
      cartItems.value = []
      wishlistItems.value = []
    }
  })

  const loadUserStates = async () => {
    if (!userStore.userInfo.isLoggedIn) {
      // 未登录时清空购物车和收藏状态
      cartItems.value = []
      wishlistItems.value = []
      return
    }
    
    try {
      // 从服务器加载购物车状态
      const cartData = await api.getCart()
      const serverCartItems = cartData.cart || []
      
      // 加载收藏状态
      const wishlistData = await api.getWishlist()
      const serverWishlistItems = wishlistData.wishlist || []
      
      // 同步购物车状态：将服务器数据转换为本地格式
      if (serverCartItems.length > 0) {
        const localCartItems = serverCartItems.map(item => ({
          book_id: item.book_id,
          quantity: item.quantity || 1
        }))
        
        // 合并本地和服务器数据，优先使用服务器数据
        const mergedCartItems = [...cartItems.value]
        serverCartItems.forEach(serverItem => {
          const existingIndex = mergedCartItems.findIndex(localItem => localItem.book_id === serverItem.book_id)
          if (existingIndex === -1) {
            mergedCartItems.push({
              book_id: serverItem.book_id,
              quantity: serverItem.quantity || 1
            })
          }
        })
        
        cartItems.value = mergedCartItems
      }
      
      // 同步收藏状态：将服务器数据转换为本地格式
      if (serverWishlistItems.length > 0) {
        const localWishlistItems = serverWishlistItems.map(item => ({
          book_id: item.book_id
        }))
        
        // 合并本地和服务器数据，优先使用服务器数据
        const mergedWishlistItems = [...wishlistItems.value]
        serverWishlistItems.forEach(serverItem => {
          const existingIndex = mergedWishlistItems.findIndex(localItem => localItem.book_id === serverItem.book_id)
          if (existingIndex === -1) {
            mergedWishlistItems.push({
              book_id: serverItem.book_id
            })
          }
        })
        
        wishlistItems.value = mergedWishlistItems
      }
    } catch (error) {
      console.error('加载用户状态失败:', error)
    }
  }

  // 应用启动时检查登录状态并加载购物车和收藏
  onMounted(async () => {
    // 检查当前是否已登录
    if (userStore.userInfo.isLoggedIn) {
      await loadUserStates()
    }
  })

  const isInCart = (bookId) => {
    const result = cartItems.value.some(item => {
      // 兼容服务器返回的数据格式
      const itemBookId = item.book_id || item.id
      
      // 确保类型一致，都转换为字符串进行比较
      const normalizedBookId = String(bookId)
      const normalizedItemBookId = String(itemBookId)
      return normalizedItemBookId === normalizedBookId
    })
    return result
  }

  const isInWishlist = (bookId) => {
    const normalizedBookId = String(bookId)
    return wishlistItems.value.some(item => {
      const itemBookId = item.book_id || item.id
      const normalizedItemBookId = String(itemBookId)
      return normalizedItemBookId === normalizedBookId
    })
  }

  const toggleCart = async (bookId) => {
    if (!userStore.userInfo.isLoggedIn) {
      alert('请先登录')
      router.push('/login')
      return
    }

    try {
      if (isInCart(bookId)) {
        // 已在购物车中，点击后移除
        const result = await api.removeFromCart(bookId)
        if (result.success) {
          // 使用标准化比较来过滤购物车项目
          const normalizedBookId = String(bookId)
          cartItems.value = cartItems.value.filter(item => {
            const itemBookId = item.book_id || item.id
            const normalizedItemBookId = String(itemBookId)
            return normalizedItemBookId !== normalizedBookId
          })
          alert('已从购物车移除')
        } else {
          alert(result.message || '移除失败')
        }
      } else {
        // 不在购物车中，点击后添加
        const result = await api.addToCart(bookId)
        if (result.success) {
          cartItems.value.push({ book_id: bookId, quantity: 1 })
          alert('加入购物车成功')
        } else {
          alert(result.message || '加入失败')
        }
      }
    } catch (error) {
      alert('购物车操作失败：' + error.message)
    }
  }

  const toggleFavorite = async (bookId) => {
    if (!userStore.userInfo.isLoggedIn) {
      alert('请先登录')
      router.push('/login')
      return
    }

    try {
      const result = await api.toggleWishlist(bookId)
      if (result.success) {
        if (isInWishlist(bookId)) {
          // 已收藏，点击后取消收藏
          const normalizedBookId = String(bookId)
          wishlistItems.value = wishlistItems.value.filter(item => {
            const itemBookId = item.book_id || item.id
            const normalizedItemBookId = String(itemBookId)
            return normalizedItemBookId !== normalizedBookId
          })
          alert('已取消收藏')
        } else {
          // 未收藏，点击后添加收藏
          wishlistItems.value.push({ book_id: bookId })
          alert('添加收藏成功')
        }
      } else {
        alert(result.message || '收藏操作失败')
      }
    } catch (error) {
      alert('收藏操作失败：' + error.message)
    }
  }

  return {
    cartItems,
    wishlistItems,
    loadUserStates,
    isInCart,
    isInWishlist,
    toggleCart,
    toggleFavorite
  }
}