import axios from 'axios'

// 替换第3行的代码
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 确保发送cookie
})

// 创建一个不使用baseURL的axios实例，用于直接访问PHP文件
const directAxiosInstance = axios.create({
  baseURL: '', // 空字符串，使用相对路径
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // 认证相关
  async checkLoginStatus() {
    const response = await axiosInstance.get('/auth/check')
    return response.data
  },

  async login(username, password) {
    const response = await axiosInstance.post('/auth/login', { username, password })
    return response.data
  },

  async logout() {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },

  async register(username, email, password) {
    const response = await axiosInstance.post('/auth/register', { username, email, password })
    return response.data
  },

  // 图书相关
  async getBooks(params = {}) {
    const response = await axiosInstance.get('/books/list', { params })
    return response.data
  },

  async getNewBooks() {
    const response = await axiosInstance.get('/books/new')
    return response.data
  },

  async getBestsellers() {
    const response = await axiosInstance.get('/books/bestsellers')
    console.log('畅销排行API响应详情:')
    response.data.forEach((book, index) => {
      console.log(`图书${index + 1}: ${book.title}, 销量: ${book.order_count}`)
    })
    return response.data
  },

  async getBookDetail(bookId) {
    const response = await axiosInstance.get(`/books/${bookId}`)
    return response.data
  },

  // 分类相关
  async getCategories() {
    const response = await axiosInstance.get('/categories')
    return response.data
  },

  // 用户相关
  async getUserProfile() {
    const response = await axiosInstance.get('/user/profile')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await axiosInstance.post('/user/update-profile', profileData)
    return response.data
  },

  async verifyCurrentPassword(currentPassword) {
    const response = await axiosInstance.post('/user/verify-password', { currentPassword })
    return response.data
  },

  async updatePassword(passwordData) {
    const response = await axiosInstance.post('/user/update-password', passwordData)
    return response.data
  },

  // 购物车相关
  async getCart() {
    const response = await axiosInstance.get('/cart/list')
    return response.data
  },

  async addToCart(bookId) {
    const response = await axiosInstance.post('/cart/add', { book_id: bookId })
    return response.data
  },

  async removeFromCart(bookId) {
    const response = await axiosInstance.post('/cart/remove', { book_id: bookId })
    return response.data
  },

  async updateCartQuantity(bookId, quantity) {
    const response = await axiosInstance.post('/cart/update', { book_id: bookId, quantity })
    return response.data
  },

  // 收藏相关
  async getWishlist() {
    const response = await axiosInstance.get('/wishlist/list')
    return response.data
  },

  async toggleWishlist(bookId) {
    const response = await axiosInstance.post('/wishlist/toggle', { book_id: bookId })
    return response.data
  },

  // 订单相关
  async getOrders() {
    const response = await axiosInstance.get('/orders/list')
    return response.data
  },

  async getOrderDetail(orderId) {
    const response = await axiosInstance.get(`/orders/${orderId}`)
    return response.data
  },

  async createOrder(orderData) {
    const response = await axiosInstance.post('/orders/create', orderData)
    return response.data
  },

  async payOrder(orderId) {
    const response = await axiosInstance.post(`/orders/${orderId}/pay`)
    return response.data
  },

  async cancelOrder(orderId) {
    const response = await axiosInstance.post(`/orders/${orderId}/cancel`)
    return response.data
  },

  async confirmReceipt(orderId) {
    const response = await axiosInstance.post(`/orders/${orderId}/confirm`)
    return response.data
  },

  // 直接购买图书
  async purchaseBook(bookId, quantity, addressInfo) {
    const response = await axiosInstance.post('/orders/create', {
      items: [{
        book_id: bookId,
        quantity: quantity,
        price: 0 // 价格会在后端查询
      }],
      address: addressInfo
    })
    return response.data
  },

  // 群聊相关
  async getChatGroups() {
    const response = await axiosInstance.get('/chat/groups', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  async getGroupMessages(groupId) {
    const response = await axiosInstance.get(`/chat/groups/${groupId}/messages`)
    return response.data
  },

  async sendGroupMessage(groupId, content) {
    const response = await axiosInstance.post(`/chat/groups/${groupId}/send-message`, { 
      content: content 
    })
    return response.data
  },

  async deleteGroupMessage(messageId) {
    const response = await axiosInstance.post('/chat/messages/delete', { 
      message_id: messageId 
    })
    return response.data
  },

  // 搜索相关
  async searchUsers(keyword) {
    const response = await axiosInstance.get('/search', { 
      params: { keyword, type: 'users' } 
    })
    return response.data
  },

  async searchGroups(keyword) {
    const response = await axiosInstance.get('/search', { 
      params: { keyword, type: 'groups' } 
    })
    return response.data
  },

  async sendFriendRequest(targetUserId) {
    const response = await axiosInstance.post('/friend-request/send', { 
      target_user_id: targetUserId 
    })
    return response.data
  },

  async sendGroupJoinRequest(groupId) {
    const response = await axiosInstance.post('/chat/groups/join-request', { 
      group_id: groupId 
    })
    return response.data
  },

  // 申请列表相关
  async getRequestsList() {
    const response = await axiosInstance.get('/requests', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  async handleFriendRequest(requestId, action) {
    const response = await axiosInstance.post('/requests/handle-friend', {
      request_id: requestId,
      action: action
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  async handleGroupJoinRequest(requestId, action) {
    const response = await axiosInstance.post('/requests/handle-group', {
      request_id: requestId,
      action: action
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 好友相关
  async getFriendsList() {
    const response = await axiosInstance.get('/friends/list', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 私聊相关
  async getPrivateMessages(friendId) {
    const response = await axiosInstance.get(`/friends/messages/${friendId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  async sendPrivateMessage(toUserId, content) {
    const response = await axiosInstance.post('/friends/send', {
      to_user_id: toUserId,
      content: content
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 未读消息计数相关
  async getUnreadMessageCount(friendId, lastViewTime) {
    const response = await axiosInstance.get(`/friends/unread-count/${friendId}`, {
      params: { last_view_time: lastViewTime },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 好友在线状态（新的在线状态系统）
  async getFriendsOnlineStatus() {
    const response = await axiosInstance.get('/friends/online-status', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 心跳检测（使用现有的API路由）
  async heartbeat() {
    const response = await axiosInstance.get('/friends/online-status', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 检查我发出的申请状态变化
  async checkSentRequests() {
    const response = await axiosInstance.get('/requests/check-sent', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 删除好友
  async deleteFriend(friendId) {
    const response = await axiosInstance.delete(`/friends/delete/${friendId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 地址管理相关
  async getUserAddresses() {
    const response = await axiosInstance.get('/user/addresses')
    return response.data
  },

  async addAddress(addressData) {
    const response = await axiosInstance.post('/user/addresses/add', addressData)
    return response.data
  },

  async updateAddress(addressId, addressData) {
    const response = await axiosInstance.post(`/user/addresses/update/${addressId}`, addressData)
    return response.data
  },

  async deleteAddress(addressId) {
    const response = await axiosInstance.post(`/user/addresses/delete/${addressId}`)
    return response.data
  },

  async setDefaultAddress(addressId) {
    const response = await axiosInstance.post(`/user/addresses/set-default/${addressId}`)
    return response.data
  },

  // 群成员相关
  async getGroupMembers(groupId) {
    const response = await axiosInstance.get(`/chat/groups/${groupId}/members`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 创建群聊
  async createChatGroup(groupName, description) {
    console.log('🚀 开始创建群聊，群名:', groupName, '描述:', description)
    
    try {
      // 使用符合路由系统的路径
      const url = '/api/chat/groups/create'
      console.log('📡 请求URL:', url)
      
      const requestData = {
        group_name: groupName,
        description: description || ''
      }
      console.log('📤 请求数据:', requestData)
      
      const response = await directAxiosInstance.post(url, requestData)
      console.log('✅ 创建群聊成功:', response.data)
      
      return response.data
    } catch (error) {
      console.error('❌ 创建群聊失败:', error)
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  },

  // 退出群聊
  async exitGroup(groupId) {
    try {
      const response = await directAxiosInstance.post('/api/chat/exit-group', {
        group_id: groupId
      })
      return response.data
    } catch (error) {
      console.error('退出群聊失败:', error)
      throw error
    }
  },

  // 解散群聊（群主功能）
  async disbandGroup(groupId) {
    try {
      const response = await directAxiosInstance.post('/api/chat/disband-group', {
        group_id: groupId
      })
      return response.data
    } catch (error) {
      console.error('解散群聊失败:', error)
      throw error
    }
  }
}
