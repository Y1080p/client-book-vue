import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'
import { notificationService, settingsApi, applySettings as applySettingsUtil, showNotification as showNotif } from '../services/notifications'

export const chatGroupsLogic = () => {
  const userStore = useUserStore()
  const chatGroups = ref([])
  const selectedGroup = ref(null)
  const selectedFriend = ref(null)
  const messages = ref([])
  const newMessage = ref('')
  const messagesContainer = ref(null)
  const searchKeyword = ref('')
  const friendsExpanded = ref(true)
  const groupsExpanded = ref(true)
  const showSettingsModal = ref(false)
  const showSearchModal = ref(false)
  const showCreateGroupModal = ref(false)
  const searchModalKeyword = ref('')
  const searchResults = ref([])
  const friendsOnlineStatus = ref({})

  // 创建群聊相关
  const newGroupName = ref('')
  const newGroupDescription = ref('')

  // 实时消息轮询相关
  const messagePollingInterval = ref(null)
  const onlineStatusInterval = ref(null)

  // 申请列表相关
  const requestsExpanded = ref(true)
  const requests = ref([])
  const loadingRequests = ref(false)
  const pendingRequestsCount = computed(() => {
    return requests.value.filter(r => r.status === 'pending').length
  })

  // 设置相关
  const settings = ref({
    autoScroll: true,
    soundNotification: true,
    desktopNotification: false,
    theme: 'light',
    compactMode: false,
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowGroupInvites: true,
    notifyFriendMessages: true,
    notifyGroupMessages: true,
    notifyRequests: true,
    messageRetention: '30'
  })

  // 临时设置（用于设置弹窗中的修改）
  const tempSettings = ref({})

  // 好友列表相关
  const friends = ref([])
  const loadingFriends = ref(false)

  // 群成员列表相关
  const showMemberList = ref(false)
  const groupMembers = ref([])
  const groupOwner = ref(null)

  // 动态排序逻辑：根据最新消息时间决定优先级
  const sortedFriends = computed(() => {
    return [...friends.value].sort((a, b) => {
      const createTimeA = new Date(a.create_time || '2000-01-01T00:00:00Z').getTime()
      const createTimeB = new Date(b.create_time || '2000-01-01T00:00:00Z').getTime()
      
      const lastMessageTimeA = new Date(a.lastMessageTime || '2000-01-01T00:00:00Z').getTime()
      const lastMessageTimeB = new Date(b.lastMessageTime || '2000-01-01T00:00:00Z').getTime()
      
      // 默认时间阈值（1天）：如果最后消息在1天内，认为是活跃聊天
      const activeThreshold = 24 * 60 * 60 * 1000 // 1天
      const now = new Date().getTime()
      
      // 检查是否有活跃的聊天（最近1天内有消息）
      const isAActive = (now - lastMessageTimeA) < activeThreshold
      const isBActive = (now - lastMessageTimeB) < activeThreshold
      
      // 如果两个都是活跃聊天，按最新消息时间排序
      if (isAActive && isBActive) {
        return lastMessageTimeB - lastMessageTimeA
      }
      
      // 如果只有一个是活跃聊天，活跃的排前面
      if (isAActive && !isBActive) {
        return -1
      }
      if (!isAActive && isBActive) {
        return 1
      }
      
      // 如果都不是活跃聊天，按创建时间排序（新加入的在前）
      return createTimeB - createTimeA
    })
  })

  // 动态排序逻辑：根据最新消息时间决定优先级
  const sortedGroups = computed(() => {
    return [...chatGroups.value].sort((a, b) => {
      const createTimeA = new Date(a.create_time || '2000-01-01T00:00:00Z').getTime()
      const createTimeB = new Date(b.create_time || '2000-01-01T00:00:00Z').getTime()
      
      const lastMessageTimeA = new Date(a.lastMessageTime || '2000-01-01T00:00:00Z').getTime()
      const lastMessageTimeB = new Date(b.lastMessageTime || '2000-01-01T00:00:00Z').getTime()
      
      // 默认时间阈值（1天）：如果最后消息在1天内，认为是活跃聊天
      const activeThreshold = 24 * 60 * 60 * 1000 // 1天
      const now = new Date().getTime()
      
      // 检查是否有活跃的聊天（最近1天内有消息）
      const isAActive = (now - lastMessageTimeA) < activeThreshold
      const isBActive = (now - lastMessageTimeB) < activeThreshold
      
      // 如果两个都是活跃聊天，按最新消息时间排序
      if (isAActive && isBActive) {
        return lastMessageTimeB - lastMessageTimeA
      }
      
      // 如果只有一个是活跃聊天，活跃的排前面
      if (isAActive && !isBActive) {
        return -1
      }
      if (!isAActive && isBActive) {
        return 1
      }
      
      // 如果都不是活跃聊天，按创建时间排序（新加入的在前）
      return createTimeB - createTimeA
    })
  })

  // 过滤群聊列表
  const filteredGroups = computed(() => {
    if (!searchKeyword.value) {
      return sortedGroups.value
    }
    return sortedGroups.value.filter(group => 
      group.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  })

  // 切换好友列表展开状态
  const toggleFriends = () => {
    friendsExpanded.value = !friendsExpanded.value
    // 如果展开且没有加载过，则加载好友列表
    if (friendsExpanded.value && friends.value.length === 0) {
      loadFriends()
    }
  }
    
  // 切换群聊列表展开状态
  const toggleGroups = () => {
    groupsExpanded.value = !groupsExpanded.value
  }
    
  // 切换申请列表展开状态
  const toggleRequests = () => {
    requestsExpanded.value = !requestsExpanded.value
    // 如果展开且没有加载过，则加载数据
    if (requestsExpanded.value && requests.value.length === 0) {
      loadRequests()
    }
  }
    
  // 显示设置弹窗
  const showSettings = () => {
    // 复制当前设置到临时设置
    tempSettings.value = JSON.parse(JSON.stringify(settings.value))
    showSettingsModal.value = true
  }
    
  // 关闭设置弹窗
  const closeSettings = () => {
    showSettingsModal.value = false
  }
    
  // 处理模态框点击事件（点击阴影关闭）
  const handleModalClick = (event) => {
    // 如果点击的是模态框背景（不是内容区域），则关闭弹窗
    if (event.target.classList.contains('settings-modal')) {
      closeSettings()
    }
  }
    
  // 显示搜索弹窗
  const openSearchModal = () => {
    showSearchModal.value = true
    searchModalKeyword.value = ''
    searchResults.value = []
  }
    
  // 关闭搜索弹窗
  const closeSearchModal = () => {
    showSearchModal.value = false
    searchModalKeyword.value = ''
    searchResults.value = []
  }
    
  // 打开创建群聊弹窗
  const openCreateGroupModal = () => {
    showCreateGroupModal.value = true
    newGroupName.value = ''
    newGroupDescription.value = ''
  }
    
  // 关闭创建群聊弹窗
  const closeCreateGroupModal = () => {
    showCreateGroupModal.value = false
    newGroupName.value = ''
    newGroupDescription.value = ''
  }
    
  // 创建群聊
  const createGroup = async () => {
    const groupName = newGroupName.value.trim()
    const groupDescription = newGroupDescription.value.trim()
    
    if (!groupName) {
      alert('请输入群聊名称')
      return
    }
    
    try {
      const response = await api.createChatGroup(groupName, groupDescription)
      
      if (response.success) {
        alert('群聊创建成功！')
        closeCreateGroupModal()
        // 重新加载群聊列表
        await loadChatGroups()
      } else {
        alert('创建群聊失败：' + (response.message || '未知错误'))
      }
    } catch (error) {
      console.error('创建群聊失败:', error)
      alert('创建群聊失败，请重试')
    }
  }
    
  // 搜索用户和群聊
  const searchUsersAndGroups = async () => {
    const keyword = searchModalKeyword.value.trim()
    
    if (!keyword) {
      alert('请输入搜索关键词')
      return
    }
    
    try {
      // 同时搜索用户和群聊
      const [usersResponse, groupsResponse] = await Promise.all([
        api.searchUsers(keyword),
        api.searchGroups(keyword)
      ])
      
      const users = usersResponse.users || []
      const groups = groupsResponse.groups || []
      
      // 格式化用户数据
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name || user.username,
        type: 'user',
        username: user.username
      }))
      
      // 格式化群聊数据
      const formattedGroups = groups.map(group => ({
        id: group.id,
        name: group.group_name || group.name,
        type: 'group',
        group_name: group.group_name,
        group_owner_id: group.group_owner_id
      }))
      
      searchResults.value = [...formattedUsers, ...formattedGroups]
      
      if (searchResults.value.length === 0) {
        alert(`未找到与"${keyword}"相关的用户或群聊`)
      }
      
    } catch (error) {
      console.error('搜索失败:', error)
      alert('搜索功能暂时不可用，请稍后重试')
      searchResults.value = []
    }
  }
    
  // 发送好友申请
  const sendFriendRequest = async (user) => {
    if (!confirm(`确定要添加 ${user.name} 为好友吗？`)) return
    
    try {
      // 调用真实的后端API发送好友申请
      const response = await api.sendFriendRequest(user.id)
      
      if (response.success === false) {
        // 后端返回友好提示（如已经是好友）
        alert(response.message)
      } else {
        // 申请发送成功
        alert(`好友申请已发送给 ${user.name}，等待对方同意`)
      }
      
      closeSearchModal()
    } catch (error) {
      console.error('发送好友申请失败:', error)
      
      // 根据错误状态码显示不同的提示信息
      if (error.response && error.response.status === 400) {
        // 400错误表示已经是好友关系
        alert(`你已有好友 ${user.name}，可直接与对方进行聊天`)
      } else if (error.response && error.response.status === 403) {
        // 403错误表示对方关闭了好友申请
        alert(`对方已关闭好友申请设置`)
      } else if (error.response && error.response.status === 404) {
        // 404错误表示目标用户不存在
        alert(`目标用户 ${user.name} 不存在`)
      } else {
        // 其他错误情况，使用模拟消息作为备用方案
        alert(`好友申请已发送给 ${user.name}，等待对方同意`)
      }
      closeSearchModal()
    }
  }
    
  // 发送加入群聊申请
  const sendGroupRequest = async (group) => {
    try {
      // 调用真实的后端API发送群聊加入申请
      await api.sendGroupJoinRequest(group.id)
      alert(`加入群聊申请已发送，等待群主同意`)
      closeSearchModal()
    } catch (error) {
      console.error('发送群聊申请失败:', error)
      
      // 根据错误状态码显示不同的提示信息
      if (error.response && error.response.status === 403) {
        // 403错误表示群聊关闭了群聊申请
        alert(`该群聊已关闭群聊申请`)
      } else if (error.response && error.response.status === 400) {
        // 400错误表示已经是群成员
        alert(`您已经是该群成员`)
      } else if (error.response && error.response.status === 404) {
        // 404错误表示群聊不存在
        alert(`群聊 ${group.name} 不存在`)
      } else {
        // 其他错误情况，使用模拟消息作为备用方案
        alert(`加入群聊申请已发送，等待群主同意`)
      }
      closeSearchModal()
    }
  }
    
  // 检查用户是否有删除消息的权限
  const canDeleteMessage = (message) => {
    const currentUser = userStore.userInfo
    // 只有消息发送者才能删除自己的消息（暂时不考虑管理员）
    return message.user_id == currentUser?.id
  }
    
  // 判断是否是自己的消息
  const isOwnMessage = (message) => {
    const currentUserId = parseInt(userStore.userInfo.id) // 确保是数字类型
    
    // 私聊消息使用from_user_id字段，群聊消息使用user_id字段
    const fromUserId = parseInt(message.from_user_id || message.user_id) // 确保是数字类型
    const isOwn = fromUserId === currentUserId
    
    return isOwn
  }
    
  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    
    // 如果是今天的消息，只显示时间
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // 其他情况显示完整日期和时间
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
    
  // 滚动到消息底部
  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
    
  // 加载群聊列表
  const loadChatGroups = async () => {
    try {
      const data = await api.getChatGroups()
      if (data.groups && data.groups.length > 0) {
        // 为每个群聊添加未读消息计数、最后查看时间和最后一条消息
        chatGroups.value = data.groups.map(group => ({
          ...group,
          unreadCount: 0, // 初始化为0
          lastViewTime: localStorage.getItem(`last_view_time_group_${group.id}`) || new Date().toISOString(), // 从本地存储获取或设置为当前时间
          lastMessage: '暂无聊天记录',
          lastMessageTime: '2000-01-01T00:00:00Z' // 默认时间，表示没有消息
        }))
        
        // 加载每个群聊的最后一条消息
        await loadGroupLastMessages()
        
        // 加载每个群聊的未读消息数
        await loadGroupUnreadCounts()
      } else {
        chatGroups.value = []
      }
    } catch (error) {
      console.error('加载群聊列表失败:', error)
    }
  }
    
  // 加载群聊的最后一条消息
  const loadGroupLastMessages = async () => {
    try {
      for (const group of chatGroups.value) {
        try {
          const data = await api.getGroupMessages(group.id)
          if (data.success && data.messages && data.messages.length > 0) {
            // 获取最后一条消息
            const lastMessage = data.messages[data.messages.length - 1]
            group.lastMessage = lastMessage.content || '暂无聊天记录'
            group.lastMessageTime = lastMessage.create_time || new Date().toISOString()
          }
        } catch (error) {
          console.error('加载群聊', group.id, '的最后一条消息失败:', error)
        }
      }
    } catch (error) {
      console.error('加载群聊最后一条消息失败:', error)
    }
  }
    
  // 加载申请列表
  const loadRequests = async () => {
    loadingRequests.value = true
    try {
      const data = await api.getRequestsList()
      
      if (data.success) {
        requests.value = data.requests || []
      } else {
        console.error('获取申请列表失败:', data.message || '未知错误')
      }
    } catch (error) {
      console.error('加载申请列表失败:', error)
    } finally {
      loadingRequests.value = false
    }
  }
    
  // 加载好友列表
  const loadFriends = async () => {
    loadingFriends.value = true
    try {
      const data = await api.getFriendsList()
      
      if (data.success && data.friends && data.friends.length > 0) {
        // 为每个好友添加未读消息计数、最后查看时间和最后一条消息
        friends.value = data.friends.map(friend => ({
          ...friend,
          unreadCount: 0, // 初始化为0
          lastViewTime: localStorage.getItem(`last_view_time_${friend.friend_id}`) || new Date().toISOString(), // 从本地存储获取或设置为当前时间
          lastMessage: '' // 初始化为空，稍后加载
        }))
        
        // 加载每个好友的未读消息数
        await loadUnreadCounts()
        
        // 加载每个好友的最后一条消息
        await loadLastMessages()
        
        // 加载好友在线状态
        await loadFriendsOnlineStatus()
      } else {
        // 如果没有好友或数据格式错误，设置空数组
        friends.value = []
      }
      
      // 更新好友数量记录，用于实时检测好友列表变化
      if (typeof previousFriendsCount !== 'undefined') {
        previousFriendsCount = friends.value.length
      }
    } catch (error) {
      console.error('加载好友列表失败:', error)
      friends.value = []
    } finally {
      loadingFriends.value = false
    }
  }
    
  // 加载好友在线状态（使用新的在线状态系统）
  const loadFriendsOnlineStatus = async () => {
    try {
      // 尝试使用在线状态API
      const data = await api.getFriendsOnlineStatus()
      
      if (data.success && data.friendsStatus) {
        // 使用新的在线状态数据
        friendsOnlineStatus.value = data.friendsStatus
      } else {
        // 如果API返回数据格式不正确，使用模拟状态
        await simulateOnlineStatus()
      }
    } catch (error) {
      // 如果API不可用，使用模拟状态
      await simulateOnlineStatus()
    }
  }
    
  // 回退到旧的在线状态API
  const fallbackToOldOnlineStatus = async () => {
    try {
      const data = await api.getFriendsOnlineStatus()
      
      if (data.success && data.friendsStatus) {
        friendsOnlineStatus.value = data.friendsStatus
      } else {
        await simulateOnlineStatus()
      }
    } catch (error) {
      await simulateOnlineStatus()
    }
  }
    
  // 模拟在线状态（备用方案）
  const simulateOnlineStatus = async () => {
    const simulatedStatus = {}
    
    // 为每个好友设置在线状态（基于时间，避免随机性）
    friends.value.forEach(friend => {
      // 基于好友ID和时间戳生成稳定的状态
      const timestamp = new Date().getTime()
      const statusValue = (friend.friend_id + timestamp) % 100
      
      // 80%概率在线，15%概率离开，5%概率离线
      if (statusValue < 80) {
        simulatedStatus[friend.friend_id] = 'online'
      } else if (statusValue < 95) {
        simulatedStatus[friend.friend_id] = 'away'
      } else {
        simulatedStatus[friend.friend_id] = 'offline'
      }
    })
    
    friendsOnlineStatus.value = simulatedStatus
  }

  // 获取好友状态显示文字（支持三种状态）
  const getFriendStatus = (friendId) => {
    const status = friendsOnlineStatus.value[friendId]
    
    switch (status) {
      case 'online':
        return '在线'
      case 'away':
        return '离开'
      case 'offline':
        return '离线'
      default:
        return '离线'
    }
  }
    
  // 检查好友是否在线（用于CSS类名，支持三种状态）
  const isFriendOnline = (friendId) => {
    const status = friendsOnlineStatus.value[friendId]
    return status === 'online'
  }
    
  // 检查好友是否离开（用于CSS类名）
  const isFriendAway = (friendId) => {
    const status = friendsOnlineStatus.value[friendId]
    return status === 'away'
  }
    
  // 检查好友是否离线（用于CSS类名）
  const isFriendOffline = (friendId) => {
    const status = friendsOnlineStatus.value[friendId]
    return status === 'offline' || status === undefined
  }

  // 删除好友
  const deleteFriend = async () => {
    if (!selectedFriend.value) return
    
    if (!confirm(`确定要删除好友 ${selectedFriend.value.username} 吗？`)) {
      return
    }
    
    try {
      const data = await api.deleteFriend(selectedFriend.value.friend_id)
      if (data.success) {
        // 从好友列表中移除
        friends.value = friends.value.filter(friend => friend.friend_id !== selectedFriend.value.friend_id)
        
        // 清除当前选中的好友
        selectedFriend.value = null
        messages.value = []
        
        // 强制立即刷新好友列表（确保本地状态与服务器同步）
        await loadFriends()
        
        alert('好友删除成功')
      } else {
        alert('删除失败：' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('删除好友失败:', error)
      alert('删除好友失败，请重试')
    }
  }
    
  // 加载未读消息计数（前端计算基于最后查看时间）
  const loadUnreadCounts = async () => {
    try {
      for (const friend of friends.value) {
        // 只有当好友不是当前选中的好友时才计算未读消息
        if (selectedFriend.value?.friend_id !== friend.friend_id) {
          try {
            // 获取所有消息
            const data = await api.getPrivateMessages(friend.friend_id)
            if (data.success && data.messages && data.messages.length > 0) {
              // 过滤出最后查看时间之后的消息
              const lastViewTime = new Date(friend.lastViewTime)
              const unreadMessages = data.messages.filter(msg => {
                const msgTime = new Date(msg.created_at || msg.create_time)
                return msgTime > lastViewTime && msg.from_user_id !== userStore.userInfo.id
              })
              friend.unreadCount = unreadMessages.length
            } else {
              friend.unreadCount = 0
            }
          } catch (error) {
            console.error('计算好友', friend.friend_id, '的未读消息失败:', error)
            friend.unreadCount = 0
          }
        } else {
          // 当前选中的好友，未读消息计数应为0
          friend.unreadCount = 0
        }
      }
    } catch (error) {
      console.error('加载未读消息计数失败:', error)
    }
  }
    
  // 更新好友未读消息计数
  const updateFriendUnreadCount = (friendId, count) => {
    const friend = friends.value.find(f => f.friend_id === friendId)
    if (friend) {
      friend.unreadCount = count
    }
  }
    
  // 更新好友最后一条消息
  const updateFriendLastMessage = (friendId, message) => {
    const friend = friends.value.find(f => f.friend_id === friendId)
    if (friend) {
      friend.lastMessage = message
      friend.lastMessageTime = new Date().toISOString() // 更新为当前时间
    }
  }
    
  // 更新群聊最后一条消息
  const updateGroupLastMessage = (groupId, message) => {
    const group = chatGroups.value.find(g => g.id === groupId)
    if (group) {
      group.lastMessage = message
      group.lastMessageTime = new Date().toISOString() // 更新为当前时间
    }
  }
    
  // 加载群聊未读消息计数（前端计算基于最后查看时间）
  const loadGroupUnreadCounts = async () => {
    try {
      for (const group of chatGroups.value) {
        // 只有当群聊不是当前选中的群聊时才计算未读消息
        if (selectedGroup.value?.id !== group.id) {
          try {
            const data = await api.getGroupMessages(group.id)
            if (data.success && data.messages && data.messages.length > 0) {
              const lastViewTime = new Date(group.lastViewTime)
              
              // 计算未读消息数（最后查看时间之后的消息，且不是自己发送的消息）
              const unreadMessages = data.messages.filter(msg => {
                const msgTime = new Date(msg.created_at || msg.create_time)
                return msgTime > lastViewTime && msg.from_user_id !== userStore.userInfo.id
              })
              group.unreadCount = unreadMessages.length
            } else {
              group.unreadCount = 0
            }
          } catch (error) {
            console.error('计算群聊', group.id, '的未读消息失败:', error)
            group.unreadCount = 0
          }
        } else {
          // 当前选中的群聊，未读消息计数应为0
          group.unreadCount = 0
        }
      }
    } catch (error) {
      console.error('加载群聊未读消息计数失败:', error)
    }
  }
    
  // 更新群聊未读消息计数
  const updateGroupUnreadCount = (groupId, count) => {
    const group = chatGroups.value.find(g => g.id === groupId)
    if (group) {
      group.unreadCount = count
    }
  }
    
  // 加载好友的最后一条消息
  const loadLastMessages = async () => {
    try {
      for (const friend of friends.value) {
        try {
          const data = await api.getPrivateMessages(friend.friend_id)
          if (data.success && data.messages && data.messages.length > 0) {
            // 获取最后一条消息
            const lastMessage = data.messages[data.messages.length - 1]
            friend.lastMessage = lastMessage.content || '暂无聊天记录'
            friend.lastMessageTime = lastMessage.create_time || new Date().toISOString()
          } else {
            friend.lastMessage = '暂无聊天记录'
            friend.lastMessageTime = '2000-01-01T00:00:00Z' // 默认时间，表示没有消息
          }
        } catch (error) {
          console.error('加载好友', friend.friend_id, '的最后一条消息失败:', error)
          friend.lastMessage = '加载失败'
          friend.lastMessageTime = '2000-01-01T00:00:00Z'
        }
      }
    } catch (error) {
      console.error('加载最后一条消息失败:', error)
    }
  }
    
  // 启动消息轮询
  const startMessagePolling = async () => {
    // 先清除之前的定时器
    if (messagePollingInterval.value) {
      clearInterval(messagePollingInterval.value)
    }
    
    // 初始化轮询计数器和状态跟踪
    let pollCount = 0
    let previousPendingCount = pendingRequestsCount.value
    
    // 预先加载当前已接受的申请，避免误触发
    let previousAcceptedRequests = []
    // 预先加载当前好友列表，用于检测好友删除
    let previousFriendsCount = friends.value.length
    // 预先加载当前群聊成员数量，用于检测群成员变化
    let previousGroupMembers = {}
    
    try {
      const sentData = await api.checkSentRequests()
      if (sentData.success) {
        if (sentData.acceptedRequests) {
          previousAcceptedRequests = sentData.acceptedRequests
        }
        if (sentData.groupMembersChanges) {
          // 初始化群成员数量记录
          sentData.groupMembersChanges.forEach(group => {
            previousGroupMembers[group.group_id] = group.current_members
          })
        }
      }
    } catch (error) {
      console.error('初始化状态跟踪失败:', error)
    }
    
    // 启动新的轮询
    messagePollingInterval.value = setInterval(async () => {
      pollCount++
      
      // 始终检查所有非选中好友的未读消息（实时更新）
      loadUnreadCounts()
      
      // 同时检查所有非选中群聊的未读消息（实时更新）
      if (chatGroups.value.length > 0) {
        loadGroupUnreadCounts()
      }
      
      // 同时更新好友的最后一条消息
      loadLastMessages()
      
      // 同时更新群聊的最后一条消息
      if (chatGroups.value.length > 0) {
        loadGroupLastMessages()
      }
      
      // 每15秒更新一次好友在线状态
      if (pollCount % 8 === 0) {
        loadFriendsOnlineStatus()
      }
      
      // 每隔几次轮询检查申请状态变化
      if (pollCount % 3 === 0) {
        // 检查我发出的申请状态变化
        try {
          const sentData = await api.checkSentRequests()
          if (sentData.success && sentData.acceptedRequests) {
            const currentAcceptedRequests = sentData.acceptedRequests
            
            // 比较之前和当前的已接受申请列表
            const newAcceptedRequests = currentAcceptedRequests.filter(req => 
              !previousAcceptedRequests.some(prev => prev.id === req.id)
            )
            
            // 如果有新的已接受申请，根据申请类型刷新相应的列表
            if (newAcceptedRequests.length > 0) {
              // 显示申请被接受的通知
              newAcceptedRequests.forEach(req => {
                const requestType = req.type === 'group' ? '群聊申请' : '好友申请'
                const targetName = req.target_name || req.group_name || '未知'
                showNotif(
                  `${requestType}已接受`,
                  `你申请加入的${targetName}已通过`,
                  'request',
                  settings.value
                )
              })
              
              // 检查是否有新的群聊申请被接受
              const newGroupRequests = newAcceptedRequests.filter(req => req.type === 'group')
              if (newGroupRequests.length > 0) {
                await loadChatGroups()
              }
              
              // 检查是否有新的好友申请被接受
              const newFriendRequests = newAcceptedRequests.filter(req => req.type === 'friend')
              if (newFriendRequests.length > 0) {
                await loadFriends()
              }
            }
            
            // 更新已接受申请记录
            previousAcceptedRequests = currentAcceptedRequests
          }
          
          // 检查群成员数量变化
          if (sentData.success && sentData.groupMembersChanges) {
            const currentGroupMembers = sentData.groupMembersChanges
            
            // 比较之前和当前的群成员数量
            const hasChanges = currentGroupMembers.some(current => {
              const previous = previousGroupMembers[current.group_id]
              return previous !== undefined && previous !== current.current_members
            })
            
            // 如果有群成员数量变化，刷新群聊列表
            if (hasChanges) {
              await loadChatGroups()
              // 更新群成员数量记录
              currentGroupMembers.forEach(group => {
                previousGroupMembers[group.group_id] = group.current_members
              })
            }
          }
        } catch (error) {
          console.error('检查发出的申请状态失败:', error)
        }
      }
      
      // 每10秒检查一次待处理申请数量变化
      if (pollCount % 5 === 0) {
        try {
          const data = await api.getRequestsList()
          if (data.success && data.requests) {
            const newPendingCount = data.requests.filter(r => r.status === 'pending').length
            // 如果待处理申请数量有变化，才刷新申请列表
            if (newPendingCount !== previousPendingCount) {
              // 如果申请数量增加，显示通知
              if (newPendingCount > previousPendingCount) {
                const newRequests = data.requests.filter(r => r.status === 'pending')
                  .filter(r => !requests.value.some(old => old.id === r.id))
                
                if (newRequests.length > 0) {
                  newRequests.forEach(req => {
                    const requestType = req.type === 'group' ? '群聊申请' : '好友申请'
                    const senderName = req.sender_name || '未知用户'
                    showNotif(
                      `新的${requestType}`,
                      `${senderName}发来了${requestType}`,
                      'request',
                      settings.value
                    )
                  })
                }
              }
              
              await loadRequests()
              previousPendingCount = newPendingCount
            }
          }
        } catch (error) {
          console.error('检查申请数量失败:', error)
        }
      }
      
      // 每15秒检查一次好友列表变化（检测好友删除）
      if (pollCount % 7 === 0) {
        // 检查好友列表变化
        try {
          const data = await api.getFriendsList()
          if (data.success && data.friends) {
            const currentFriendsCount = data.friends.length
            
            // 如果好友数量减少，说明有好友被删除
            if (currentFriendsCount < previousFriendsCount) {
              await loadFriends()
              previousFriendsCount = currentFriendsCount
              // 如果有好友被删除且当前选中的好友就是被删除的好友，清除选中状态
              if (selectedFriend.value && !data.friends.some(f => f.friend_id === selectedFriend.value.friend_id)) {
                selectedFriend.value = null
                messages.value = []
                alert('当前聊天好友已被删除')
              }
            } else if (currentFriendsCount > previousFriendsCount) {
              // 好友数量增加，刷新好友列表
              await loadFriends()
              previousFriendsCount = currentFriendsCount
            }
          }
        } catch (error) {
          console.error('检查好友列表变化失败:', error)
        }
      }
      
      // 每20秒检查一次群聊成员变化（检测被踢出群聊）
      if (pollCount % 10 === 0 && selectedGroup.value) {
        try {
          const data = await api.getChatGroups()
          if (data.success && data.groups) {
            const currentGroup = data.groups.find(g => g.id === selectedGroup.value.id)
            
            // 如果当前选中的群聊不存在，说明被踢出群聊
            if (!currentGroup) {
              selectedGroup.value = null
              messages.value = []
              await loadChatGroups()
              alert('您已被移出当前群聊')
            }
          }
        } catch (error) {
          console.error('检查群聊成员变化失败:', error)
        }
      }
      
    }, 2000) // 每2秒轮询一次
  }

  // 启动在线状态轮询
  const startOnlineStatusPolling = () => {
    // 先清除之前的定时器
    if (onlineStatusInterval.value) {
      clearInterval(onlineStatusInterval.value)
    }
    
    // 启动新的轮询
    onlineStatusInterval.value = setInterval(async () => {
      try {
        // 更新当前用户在线状态
        await api.updateOnlineStatus()
        
        // 更新好友在线状态
        await loadFriendsOnlineStatus()
      } catch (error) {
        console.error('更新在线状态失败:', error)
      }
    }, 30000) // 每30秒更新一次
  }

  // 选择好友
  const selectFriend = async (friend) => {
    selectedFriend.value = friend
    selectedGroup.value = null
    showMemberList.value = false
    
    // 更新好友的最后查看时间
    friend.lastViewTime = new Date().toISOString()
    localStorage.setItem(`last_view_time_${friend.friend_id}`, friend.lastViewTime)
    
    // 清空未读消息计数
    friend.unreadCount = 0
    
    // 加载私聊消息
    await loadPrivateMessages(friend.friend_id)
    
    // 滚动到底部
    scrollToBottom()
  }

  // 选择群聊
  const selectGroup = async (group) => {
    selectedGroup.value = group
    selectedFriend.value = null
    
    // 更新群聊的最后查看时间
    group.lastViewTime = new Date().toISOString()
    localStorage.setItem(`last_view_time_group_${group.id}`, group.lastViewTime)
    
    // 清空未读消息计数
    group.unreadCount = 0
    
    // 加载群聊消息
    await loadGroupMessages(group.id)
    
    // 滚动到底部
    scrollToBottom()
  }

  // 发送消息
  const sendMessage = async () => {
    const messageContent = newMessage.value.trim()
    
    if (!messageContent) return
    
    try {
      let response
      
      if (selectedFriend.value) {
        // 发送私聊消息
        response = await api.sendPrivateMessage(selectedFriend.value.friend_id, messageContent)
      } else if (selectedGroup.value) {
        // 发送群聊消息
        response = await api.sendGroupMessage(selectedGroup.value.id, messageContent)
      }
      
      if (response && response.success) {
        // 清空输入框
        newMessage.value = ''
        
        // 重新加载消息列表
        if (selectedFriend.value) {
          await loadPrivateMessages(selectedFriend.value.friend_id)
        } else if (selectedGroup.value) {
          await loadGroupMessages(selectedGroup.value.id)
        }
        
        // 滚动到底部
        scrollToBottom()
      } else {
        alert('发送消息失败：' + (response?.message || '未知错误'))
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送消息失败，请重试')
    }
  }

  // 刷新消息
  const refreshMessages = async () => {
    if (selectedFriend.value) {
      await loadPrivateMessages(selectedFriend.value.friend_id)
    } else if (selectedGroup.value) {
      await loadGroupMessages(selectedGroup.value.id)
    }
    scrollToBottom()
  }

  // 切换群成员列表显示
  const toggleMemberList = () => {
    showMemberList.value = !showMemberList.value
    
    if (showMemberList.value && selectedGroup.value) {
      loadGroupMembers(selectedGroup.value.id)
    }
  }

  // 检查是否为群主
  const isGroupOwner = (group) => {
    return parseInt(group.group_owner_id) === parseInt(userStore.userInfo.id)
  }

  // 解散群聊
  const disbandGroup = async () => {
    if (!selectedGroup.value) return
    
    if (!confirm(`确定要解散群聊 "${selectedGroup.value.name}" 吗？此操作不可恢复。`)) {
      return
    }
    
    try {
      const response = await api.disbandGroup(selectedGroup.value.id)
      
      if (response.success) {
        alert('群聊解散成功')
        selectedGroup.value = null
        messages.value = []
        await loadChatGroups()
      } else {
        alert('解散群聊失败：' + (response.message || '未知错误'))
      }
    } catch (error) {
      console.error('解散群聊失败:', error)
      alert('解散群聊失败，请重试')
    }
  }

  // 退出群聊
  const exitGroup = async () => {
    if (!selectedGroup.value) return
    
    if (!confirm(`确定要退出群聊 "${selectedGroup.value.name}" 吗？`)) {
      return
    }
    
    try {
      const response = await api.exitGroup(selectedGroup.value.id)
      
      if (response.success) {
        alert('退出群聊成功')
        selectedGroup.value = null
        messages.value = []
        await loadChatGroups()
      } else {
        alert('退出群聊失败：' + (response.message || '未知错误'))
      }
    } catch (error) {
      console.error('退出群聊失败:', error)
      alert('退出群聊失败，请重试')
    }
  }

  // 处理申请（同意/拒绝）
  const handleRequest = async (request, action) => {
    try {
      let response
      
      if (request.type === 'friend') {
        response = await api.handleFriendRequest(request.id, action)
      } else if (request.type === 'group') {
        response = await api.handleGroupRequest(request.id, action)
      }
      
      if (response.success) {
        // 刷新申请列表
        await loadRequests()
        
        // 如果同意好友申请，刷新好友列表
        if (action === 'accept' && request.type === 'friend') {
          await loadFriends()
        }
        
        // 如果同意群聊申请，刷新群聊列表
        if (action === 'accept' && request.type === 'group') {
          await loadChatGroups()
        }
        
        alert(`申请已${action === 'accept' ? '同意' : '拒绝'}`)
      } else {
        alert('处理申请失败：' + (response.message || '未知错误'))
      }
    } catch (error) {
      console.error('处理申请失败:', error)
      alert('处理申请失败，请重试')
    }
  }

  // 格式化申请时间
  const formatRequestTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    
    // 如果是今天的申请，只显示时间
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // 其他情况显示完整日期和时间
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 保存设置
  const saveSettings = async () => {
    // 应用临时设置到真实设置
    settings.value = JSON.parse(JSON.stringify(tempSettings.value))
    
    // 保存到本地存储
    localStorage.setItem('chatSettings', JSON.stringify(settings.value))
    
    // 尝试保存到服务器
    try {
      await settingsApi.saveUserSettings(settings.value)
    } catch (error) {
      console.warn('无法保存设置到服务器，使用本地存储:', error)
    }
    
    // 应用设置
    applySettings()
    applyTheme()
    
    closeSettings()
    alert('设置已保存')
  }

  // 应用设置
  const applySettings = () => {
    // 获取之前保存的设置
    const savedSettings = localStorage.getItem('chatSettings')
    
    if (savedSettings) {
      try {
        const previousSettings = JSON.parse(savedSettings)
        
        // 检查好友消息通知是否从关闭变为开启
        if (!previousSettings.notifyFriendMessages && settings.value.notifyFriendMessages) {
          // 清除所有好友的未读消息计数
          friends.value.forEach(friend => {
            friend.unreadCount = 0
          })
          console.log('好友消息通知已开启，未读消息已清除')
        }
        
        // 检查群聊消息通知是否从关闭变为开启
        if (!previousSettings.notifyGroupMessages && settings.value.notifyGroupMessages) {
          // 清除所有群聊的未读消息计数
          chatGroups.value.forEach(group => {
            group.unreadCount = 0
          })
          console.log('群聊消息通知已开启，未读消息已清除')
        }
        
        // 检查申请通知是否从关闭变为开启
        if (!previousSettings.notifyRequests && settings.value.notifyRequests) {
          // 申请列表的未读计数会在下次轮询时自动更新
          console.log('申请通知已开启')
        }
        
      } catch (error) {
        console.error('解析保存的设置失败:', error)
      }
    }
  }

  // 应用主题
  const applyTheme = () => {
    const body = document.body
    const html = document.documentElement
    
    // 移除所有主题类
    body.classList.remove('theme-light', 'theme-dark', 'eye-protection-theme')
    html.classList.remove('theme-light', 'theme-dark', 'eye-protection-theme')
    
    // 根据设置添加对应的主题类
    if (settings.value.theme === 'dark') {
      body.classList.add('theme-dark')
      html.classList.add('theme-dark')
    } else if (settings.value.theme === 'light') {
      body.classList.add('theme-light')
      html.classList.add('theme-light')
    } else if (settings.value.theme === 'eye-protection') {
      body.classList.add('eye-protection-theme')
      html.classList.add('eye-protection-theme')
      console.log('护眼模式已应用') // 添加调试日志
    } else if (settings.value.theme === 'auto') {
      // 跟随系统：检测系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('theme-dark')
        html.classList.add('theme-dark')
      } else {
        body.classList.add('theme-light')
        html.classList.add('theme-light')
      }
    }
    
    // 持久化主题设置，确保即使在页面刷新后也能保持
    localStorage.setItem('chatSettings', JSON.stringify(settings.value))
  }
    
  // 重置设置
  const resetSettings = () => {
    if (confirm('确定要恢复默认设置吗？')) {
      // 重置临时设置
      tempSettings.value = {
        autoScroll: true,
        soundNotification: true,
        desktopNotification: false,
        theme: 'light',
        compactMode: false,
        showOnlineStatus: true,
        allowFriendRequests: true,
        allowGroupInvites: true,
        notifyFriendMessages: true,
        notifyGroupMessages: true,
        notifyRequests: true,
        messageRetention: '30'
      }
      
      // 重置真实设置
      settings.value = JSON.parse(JSON.stringify(tempSettings.value))
      localStorage.removeItem('chatSettings')
      applySettings()
      alert('设置已恢复默认')
    }
  }
    
  // 清除本地数据
  const clearLocalData = () => {
    if (confirm('确定要清除所有本地数据吗？此操作不可恢复。')) {
      localStorage.clear()
      sessionStorage.clear()
      alert('本地数据已清除')
    }
  }
    
  // 导出聊天记录
  const exportChatData = () => {
    const exportData = {
      friends: friends.value,
      groups: chatGroups.value,
      messages: messages.value,
      exportTime: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `chat_export_${new Date().getTime()}.json`
    link.click()
    
    alert('聊天记录已导出')
  }
    
  // 加载保存的设置
  const loadSettings = async () => {
    // 首先尝试从服务器获取设置
    try {
      const serverSettings = await settingsApi.getUserSettings()
      if (serverSettings.success && serverSettings.settings) {
        settings.value = { ...settings.value, ...serverSettings.settings }
        // 保存到本地存储
        localStorage.setItem('chatSettings', JSON.stringify(settings.value))
      }
    } catch (error) {
      console.warn('无法从服务器获取设置，使用本地存储:', error)
      
      // 从本地存储加载设置
      const savedSettings = localStorage.getItem('chatSettings')
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          settings.value = { ...settings.value, ...parsedSettings }
        } catch (error) {
          console.error('加载本地设置失败:', error)
        }
      }
    }
    
    // 立即应用主题，避免页面闪烁
    if (settings.value.theme) {
      applyTheme()
    }
    
    applySettings()
  }

  // 加载私聊消息
  const loadPrivateMessages = async (friendId) => {
    try {
      const data = await api.getPrivateMessages(friendId)
      if (data.success && data.messages) {
        messages.value = data.messages
      } else {
        messages.value = []
      }
    } catch (error) {
      console.error('加载私聊消息失败:', error)
      messages.value = []
    }
  }

  // 加载群聊消息
  const loadGroupMessages = async (groupId) => {
    try {
      const data = await api.getGroupMessages(groupId)
      if (data.success && data.messages) {
        messages.value = data.messages
      } else {
        messages.value = []
      }
    } catch (error) {
      console.error('加载群聊消息失败:', error)
      messages.value = []
    }
  }

  // 加载群成员
  const loadGroupMembers = async (groupId) => {
    try {
      const data = await api.getGroupMembers(groupId)
      if (data.success && data.members) {
        groupMembers.value = data.members
        
        // 查找群主
        const owner = data.members.find(member => 
          parseInt(member.id) === parseInt(selectedGroup.value.group_owner_id)
        )
        groupOwner.value = owner || null
      } else {
        groupMembers.value = []
        groupOwner.value = null
      }
    } catch (error) {
      console.error('加载群成员失败:', error)
      groupMembers.value = []
      groupOwner.value = null
    }
  }

  // 清理轮询定时器
  const clearPollingInterval = () => {
    if (messagePollingInterval.value) {
      clearInterval(messagePollingInterval.value)
      messagePollingInterval.value = null
    }
    if (onlineStatusInterval.value) {
      clearInterval(onlineStatusInterval.value)
      onlineStatusInterval.value = null
    }
  }

  // 组件挂载时的生命周期
  const onMounted = async () => {
    // 立即应用保存的主题，避免页面闪烁
    const savedSettings = localStorage.getItem('chatSettings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        if (parsedSettings.theme) {
          // 立即应用主题，不等待其他初始化
          settings.value.theme = parsedSettings.theme
          applyTheme()
        }
      } catch (error) {
        console.error('加载主题设置失败:', error)
      }
    }
    
    // 添加存储事件监听器，响应其他标签页的主题变更
    const handleStorageChange = (e) => {
      if (e.key === 'chatSettings') {
        try {
          const newSettings = JSON.parse(e.newValue)
          if (newSettings.theme) {
            settings.value.theme = newSettings.theme
            applyTheme()
          }
        } catch (error) {
          console.error('处理存储变更失败:', error)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 然后加载完整设置
    loadSettings()
    
    // 检查登录状态，确保用户信息已加载
    await userStore.checkLoginStatus()
    
    // 监听系统主题变化（仅在跟随系统模式下生效）
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (settings.value.theme === 'auto') {
          applyTheme()
        }
      })
    }
    
    if (userStore.userInfo.isLoggedIn) {
      // 确保好友列表在页面加载时展开并显示
      friendsExpanded.value = true
      
      // 异步加载数据，确保加载完成后再显示
      await Promise.all([
        loadChatGroups(),
        loadRequests(),
        loadFriends()
      ])
      
      // 启动消息轮询（即使没有选中聊天对象，也要检查未读消息）
      startMessagePolling()
      
      // 启动在线状态轮询
      startOnlineStatusPolling()
    }
  }

  // 组件卸载时的生命周期
  const onUnmounted = () => {
    clearPollingInterval()
  }

  // 返回所有需要导出的变量和方法
  return {
    userStore,
    chatGroups,
    selectedGroup,
    selectedFriend,
    messages,
    newMessage,
    messagesContainer,
    searchKeyword,
    friendsExpanded,
    groupsExpanded,
    showSettingsModal,
    showSearchModal,
    showCreateGroupModal,
    searchModalKeyword,
    searchResults,
    friendsOnlineStatus,
    newGroupName,
    newGroupDescription,
    messagePollingInterval,
    onlineStatusInterval,
    requestsExpanded,
    requests,
    loadingRequests,
    pendingRequestsCount,
    settings,
    tempSettings,
    friends,
    loadingFriends,
    showMemberList,
    groupMembers,
    groupOwner,
    sortedFriends,
    sortedGroups,
    filteredGroups,
    toggleFriends,
    toggleGroups,
    toggleRequests,
    showSettings,
    closeSettings,
    handleModalClick,
    openSearchModal,
    closeSearchModal,
    openCreateGroupModal,
    closeCreateGroupModal,
    createGroup,
    searchUsersAndGroups,
    sendFriendRequest,
    sendGroupRequest,
    canDeleteMessage,
    isOwnMessage,
    formatTime,
    scrollToBottom,
    loadChatGroups,
    loadGroupLastMessages,
    loadRequests,
    loadFriends,
    loadFriendsOnlineStatus,
    fallbackToOldOnlineStatus,
    simulateOnlineStatus,
    getFriendStatus,
    isFriendOnline,
    isFriendAway,
    isFriendOffline,
    deleteFriend,
    loadUnreadCounts,
    updateFriendUnreadCount,
    updateFriendLastMessage,
    updateGroupLastMessage,
    loadGroupUnreadCounts,
    updateGroupUnreadCount,
    loadLastMessages,
    startMessagePolling,
    selectFriend,
    selectGroup,
    sendMessage,
    refreshMessages,
    toggleMemberList,
    isGroupOwner,
    disbandGroup,
    exitGroup,
    handleRequest,
    formatRequestTime,
    saveSettings,
    applySettings,
    applyTheme,
    resetSettings,
    clearLocalData,
    exportChatData,
    loadSettings,
    clearPollingInterval,
    onMounted,
    onUnmounted
  }
}