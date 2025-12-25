<template>
  <div class="container mt-4">
    <div class="chat-container">
      <!-- 左侧导航栏 -->
      <div class="nav-sidebar">
        <!-- 设置按钮 -->
        <div class="nav-item" @click="showSettings">
          <i class="fas fa-cog nav-icon"></i>
          <span class="nav-text">设置</span>
        </div>
      </div>

      <!-- 中间：联系人列表 -->
      <div class="contacts-sidebar">
        <!-- 搜索栏 -->
        <div class="search-input-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索..."
            v-model="searchKeyword">
          <button class="add-btn" @click="openSearchModal">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      
      <!-- 好友和群聊列表 -->
      <div class="contacts-list">
        <!-- 好友列表 -->
        <div class="contacts-section">
          <div class="section-header" @click="toggleFriends">
            <i class="fas fa-user-friends"></i>
            <span class="section-title">我的好友</span>
            <i class="fas toggle-arrow" :class="friendsExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
          </div>
          <div v-if="friendsExpanded" class="section-content">
            <!-- 加载中 -->
            <div v-if="loadingFriends" class="loading-friends">
              <i class="fas fa-spinner fa-spin"></i>
              <div>加载中...</div>
            </div>
            <!-- 无好友 -->
            <div v-else-if="friends.length === 0" class="no-friends-tip">
              <i class="fas fa-user-friends"></i>
              <div>暂无好友</div>
            </div>
            <!-- 有好友 -->
            <div v-else>
              <div 
                v-for="friend in sortedFriends" 
                :key="friend.friend_id" 
                class="friend-item" 
                :class="{ active: selectedFriend?.friend_id === friend.friend_id }"
                @click="selectFriend(friend)">
                
                <!-- 好友头像 + 名称 -->
                <div class="friend-avatar">
                  <i class="fas fa-user"></i>
                </div>
                
                <div class="friend-info">
                  <div class="friend-name">{{ friend.username }}</div>
                  <div class="friend-status" :class="{ 'online': isFriendOnline(friend.friend_id), 'away': isFriendAway(friend.friend_id), 'offline': isFriendOffline(friend.friend_id) }">{{ getFriendStatus(friend.friend_id) }}</div>
                </div>
                <!-- 最后一条消息 -->
                <div class="last-message">{{ friend.lastMessage || '暂无聊天记录' }}</div>
                <!-- 未读消息计数 -->
                <div v-if="friend.unreadCount > 0" 
                     class="unread-badge" 
                     :class="{ 'unread-badge-disabled': !settings.notifyFriendMessages }">
                  <span v-if="settings.notifyFriendMessages">{{ friend.unreadCount > 9 ? '9+' : friend.unreadCount }}</span>
                  <span v-else>∅{{ friend.unreadCount > 9 ? '9+' : friend.unreadCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 群聊列表 -->
        <div class="contacts-section">
          <div class="section-header" @click="toggleGroups">
            <i class="fas fa-users"></i>
            <span class="section-title">我的群聊</span>
            <button class="btn btn-sm btn-outline-primary create-group-btn" @click.stop="openCreateGroupModal">
              <i class="fas fa-plus"></i> 创建群聊
            </button>
            <i class="fas toggle-arrow" :class="groupsExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
          </div>
          <div v-if="groupsExpanded" class="section-content">
            <!-- 暂无群聊提示 -->
            <div v-if="filteredGroups.length === 0" class="no-groups-tip">
              <i class="fas fa-users"></i>
              <div>暂无群聊</div>
            </div>
            <!-- 群聊列表 -->
            <div 
              v-for="group in filteredGroups" 
              :key="group.id" 
              class="group-item" 
              :class="{ active: selectedGroup?.id === group.id }"
              @click="selectGroup(group)">
              
              <!-- 群头像 + 名称 + 描述 -->
              <div class="group-avatar">
                <i class="fas fa-users"></i>
              </div>
              
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-desc">{{ group.member_count }} 位成员</div>
              </div>
              
              <!-- 最后一条消息 -->
              <div class="last-message">{{ group.lastMessage || '暂无聊天记录' }}</div>
              
              <!-- 未读消息计数 -->
              <div v-if="group.unreadCount > 0" 
                   class="unread-badge" 
                   :class="{ 'unread-badge-disabled': !settings.notifyGroupMessages }">
                <span v-if="settings.notifyGroupMessages">{{ group.unreadCount > 9 ? '9+' : group.unreadCount }}</span>
                <span v-else>∅{{ group.unreadCount > 9 ? '9+' : group.unreadCount }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 申请列表 -->
        <div class="contacts-section">
          <div class="section-header" @click="toggleRequests">
            <i class="fas fa-bell"></i>
            <span class="section-title">申请列表</span>
            <span v-if="pendingRequestsCount > 0" 
                  class="request-badge" 
                  :class="{ 'request-badge-disabled': !settings.notifyRequests }">
              <span v-if="settings.notifyRequests">{{ pendingRequestsCount > 9 ? '9+' : pendingRequestsCount }}</span>
              <span v-else>∅{{ pendingRequestsCount > 9 ? '9+' : pendingRequestsCount }}</span>
            </span>
            <i class="fas toggle-arrow" :class="requestsExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
          </div>
          <div v-if="requestsExpanded" class="section-content">
            <!-- 加载中 -->
            <div v-if="loadingRequests" class="loading-requests">
              <i class="fas fa-spinner fa-spin"></i>
              <div>加载中...</div>
            </div>
            <!-- 无申请 -->
            <div v-else-if="requests.length === 0" class="no-requests-tip">
              <i class="fas fa-bell-slash"></i>
              <div>暂无申请</div>
            </div>
            <!-- 有申请 -->
            <div v-else>
              <div 
                v-for="request in requests" 
                :key="request.id" 
                class="request-item">
                
                <div class="request-avatar">
                  <i :class="request.type === 'friend' ? 'fas fa-user' : 'fas fa-users'"></i>
                </div>
                
                <div class="request-info">
                  <div class="request-message">{{ request.message }}</div>
                  <div class="request-time">{{ formatRequestTime(request.create_time) }}</div>
                </div>
                
                <div class="request-actions" v-if="request.status === 'pending'">
                  <button 
                    class="btn btn-sm btn-success me-1"
                    @click="handleRequest(request, 'accept')">
                    同意
                  </button>
                  <button 
                    class="btn btn-sm btn-danger"
                    @click="handleRequest(request, 'reject')">
                    拒绝
                  </button>
                </div>
                <div class="request-status" v-else>
                  <span :class="request.status === 'accepted' ? 'text-success' : 'text-danger'">
                    {{ request.status === 'accepted' ? '已同意' : '已拒绝' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：聊天区域 -->
    <div class="chat-main">
      <!-- 聊天标题栏 -->
      <div class="chat-header">
        <span class="current-chat">
          <span v-if="selectedGroup">
            <i class="fas fa-users me-2"></i>{{ selectedGroup.name }}
          </span>
          <span v-else-if="selectedFriend">
            <i class="fas fa-user me-2"></i>{{ selectedFriend.username }}
          </span>
          <span v-else>
            聊天区
          </span>
        </span>
        <div v-if="!!selectedGroup || !!selectedFriend" class="header-buttons">
          <!-- 群主显示解散群聊按钮，普通成员显示退出群聊按钮 -->
          <button v-if="selectedGroup && isGroupOwner(selectedGroup)" class="btn btn-sm btn-outline-danger me-2" @click="disbandGroup">
            <i class="fas fa-trash"></i> 解散群聊
          </button>
          <button v-else-if="selectedGroup" class="btn btn-sm btn-outline-danger me-2" @click="exitGroup">
            <i class="fas fa-sign-out-alt"></i> 退出群聊
          </button>
          <span v-if="selectedGroup" class="badge bg-primary" @click="toggleMemberList">{{ selectedGroup.member_count }} 位成员</span>
          <button class="btn btn-sm btn-outline-secondary" @click="refreshMessages">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button v-if="selectedFriend" class="btn btn-sm btn-outline-danger" @click="deleteFriend">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- 聊天区域容器 -->
      <div class="chat-area-container" :class="{ 'with-member-list': showMemberList }">
        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer" :class="{ 'with-member-list': showMemberList }">
        <div v-if="!!selectedGroup || !!selectedFriend">
          
          <!-- 消息列表 -->
          <div 
            v-for="message in messages" 
            :key="message.id" 
            class="message-item" 
            :class="{ 'own-message': isOwnMessage(message) }"
>
            
            <!-- 其他人的消息显示头像 -->
            <div v-if="!isOwnMessage(message)" class="message-avatar">
              <i class="fas fa-user"></i>
            </div>
            
            <div class="message-content">
              <!-- 消息头部信息：用户名、时间和删除按钮 -->
              <div class="message-header">
                <!-- 其他人的消息显示用户名 -->
                <span v-if="!isOwnMessage(message)" class="username">{{ message.username || '用户' }}</span>
                <span class="timestamp">{{ formatTime(message.create_time) }}</span>
                <!-- 删除按钮 -->
                <!-- <button 
                  v-if="canDeleteMessage(message)" 
                  class="btn btn-sm btn-outline-danger ms-2" 
                  @click="deleteMessage(message.id)">
                  <i class="fas fa-trash"></i>
                </button> -->
              </div>
              <!-- 消息气泡 -->
              <div class="message-bubble">{{ message.content }}</div>
            </div>
            
            <!-- 自己的消息显示头像 -->
            <div v-if="isOwnMessage(message)" class="message-avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>
          
          <!-- 无消息提示 -->
          <div v-if="messages.length === 0" class="empty-tip">
            <i class="fas fa-comments empty-icon"></i>
            <div class="empty-subtext">还没有消息，开始聊天吧</div>
          </div>
        </div>
        
        <div v-else class="empty-tip">
          <!-- 未选择聊天对象的提示 -->
          <i class="fas fa-comments empty-icon"></i>
          <div class="empty-subtext">点击左侧好友或者群聊开始聊天吧</div>
        </div>
      </div>

        <!-- 群成员列表侧边栏 -->
        <div v-if="showMemberList && selectedGroup" class="member-list-sidebar">
          <div class="member-list-header">
            <h5>群成员 ({{ selectedGroup.member_count }})</h5>
            <button class="btn-close" @click="toggleMemberList">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="member-list-content">
            <!-- 群主 -->
            <div class="member-item owner" :class="{ 'current-user': parseInt(groupOwner?.id) == parseInt(userStore.userInfo.id) }">
              <div class="member-avatar">
                <i class="fas fa-crown"></i>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ groupOwner?.username || '群主' }}
                  <span v-if="parseInt(groupOwner?.id) == parseInt(userStore.userInfo.id)" class="me-label">我</span>
                </div>
                <div class="member-role">群主</div>
              </div>
            </div>
            
            <!-- 普通成员 -->
            <div 
              v-for="member in groupMembers" 
              :key="member.id" 
              class="member-item"
              :class="{ 'current-user': parseInt(member.id) == parseInt(userStore.userInfo.id) }">
              <div class="member-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="member-info">
                <div class="member-name">
                  {{ member.username }}
                  <span v-if="parseInt(member.id) == parseInt(userStore.userInfo.id)" class="me-label">我</span>
                </div>
                <div class="member-role">成员</div>
              </div>
            </div>
            
            <!-- 无成员提示 -->
            <div v-if="groupMembers.length === 0" class="no-members-tip">
              <i class="fas fa-users"></i>
              <div>暂无其他成员</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div v-if="!!selectedGroup || !!selectedFriend" class="chat-input-area">
        <div class="input-group msg-input-container">
          <textarea 
            v-model="newMessage" 
            class="form-control msg-input" 
            placeholder="输入消息..." 
            rows="4"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="newMessage += '\n'"></textarea>
          <button class="btn btn-primary send-button" @click="sendMessage" :disabled="!newMessage.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="input-hint">按 Enter 发送，Shift+Enter 换行</div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettingsModal" class="settings-modal" @click="handleModalClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>设置</h5>
          <button type="button" class="btn-close" @click="closeSettings" aria-label="关闭"></button>
        </div>
        <div class="modal-body" style="max-height: 800px; overflow-y: auto;">
          <div class="settings-section">
            <h6>界面设置</h6>
            <div class="setting-item">
              <label class="setting-label">主题模式：</label>
              <select v-model="tempSettings.theme" class="form-select form-select-sm">
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
                <option value="eye-protection">护眼模式</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.compactMode" />
                紧凑模式
              </label>
            </div>
          </div>
          
          <div class="settings-section">
            <h6>隐私设置</h6>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.showOnlineStatus" />
                显示在线状态
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.allowFriendRequests" />
                允许好友申请
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.allowGroupInvites" />
                允许群聊申请
              </label>
            </div>
          </div>
          
          <div class="settings-section">
            <h6>通知设置</h6>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.notifyFriendMessages" />
                好友消息通知
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.notifyGroupMessages" />
                群聊消息通知
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" v-model="tempSettings.notifyRequests" />
                申请通知
              </label>
            </div>
          </div>
          
          <div class="settings-section">
            <h6>数据设置</h6>
            <div class="setting-item">
              <label class="setting-label">消息保留时间：</label>
              <select v-model="tempSettings.messageRetention" class="form-select form-select-sm">
                <option value="30">30天</option>
                <option value="90">90天</option>
                <option value="180">180天</option>
                <option value="forever">永久保留</option>
              </select>
            </div>
            <div class="setting-item">
              <button class="btn btn-sm btn-outline-secondary" @click="clearLocalData">
                清除本地数据
              </button>
              <button class="btn btn-sm btn-outline-danger ms-2" @click="exportChatData">
                导出聊天记录
              </button>
            </div>
          </div>
          
          <div class="settings-actions">
            <button class="btn btn-primary" @click="saveSettings">保存设置</button>
            <button class="btn btn-outline-secondary ms-2" @click="resetSettings">恢复默认</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索弹窗 -->
    <div v-if="showSearchModal" class="search-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>搜索用户和群聊</h5>
          <button class="close-btn" @click="closeSearchModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 搜索输入框 -->
          <div class="search-modal-input">
            <input 
              type="text" 
              v-model="searchModalKeyword" 
              placeholder="输入用户名或群聊名称..."
              @keyup.enter="searchUsersAndGroups">
            <button class="btn btn-primary" @click="searchUsersAndGroups">
              <i class="fas fa-search"></i>
            </button>
          </div>
          
          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="item in searchResults" 
              :key="item.id" 
              class="search-result-item">
              
              <div class="result-avatar">
                <i :class="item.type === 'user' ? 'fas fa-user' : 'fas fa-users'"></i>
              </div>
              
              <div class="result-info">
                <div class="result-name">{{ item.name }}</div>
                <div class="result-type">{{ item.type === 'user' ? '用户' : '群聊' }}</div>
              </div>
              
              <div class="result-actions">
                <button 
                  v-if="item.type === 'user'" 
                  class="btn btn-sm btn-outline-primary"
                  @click="sendFriendRequest(item)">
                  添加好友
                </button>
                <button 
                  v-if="item.type === 'group'" 
                  class="btn btn-sm btn-outline-success"
                  @click="sendGroupRequest(item)">
                  申请加入
                </button>
              </div>
            </div>
          </div>
          
          <!-- 暂无搜索结果 -->
          <div v-else-if="searchModalKeyword" class="no-results">
            <i class="fas fa-search"></i>
            <div>未找到相关用户或群聊</div>
          </div>
          
          <!-- 提示信息 -->
          <div v-else class="search-tip">
            <p>输入用户名或群聊名称进行搜索</p>
            <p class="text-muted small">添加好友需要对方同意，加入群聊需要群主同意</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建群聊弹窗 -->
    <div v-if="showCreateGroupModal" class="create-group-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h5>创建新群聊</h5>
          <button class="close-btn" @click="closeCreateGroupModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>群聊名称</label>
            <input 
              type="text" 
              v-model="newGroupName" 
              placeholder="请输入群聊名称..."
              class="form-control"
              maxlength="50">
            <small class="form-text text-muted">最多50个字符</small>
          </div>
          <div class="form-group">
            <label>群聊描述（可选）</label>
            <textarea 
              v-model="newGroupDescription" 
              placeholder="请输入群聊描述..."
              class="form-control"
              rows="3"
              maxlength="200"></textarea>
            <small class="form-text text-muted">最多200个字符</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCreateGroupModal">取消</button>
          <button class="btn btn-primary" @click="createGroup" :disabled="!newGroupName.trim()">创建群聊</button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 页尾组件 -->
  <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { api } from '../services/api'
import { notificationService, settingsApi, applySettings as applySettingsUtil, showNotification as showNotif } from '../services/notifications'
import Footer from '../components/Footer.vue'

// 导入拆分后的 JavaScript 模块
import { chatGroupsLogic } from '../js/ChatGroups.js'

// 获取拆分后的逻辑模块实例
const chatLogic = chatGroupsLogic()

// 使用拆分后的逻辑
const {
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
  applySettings,
  applyTheme,
  resetSettings,
  clearLocalData,
  exportChatData,
  loadSettings,
  clearPollingInterval,
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
  onMounted: chatGroupsMounted,
  onUnmounted: chatGroupsUnmounted
} = chatLogic

onMounted(async () => {
  await chatGroupsMounted()
})

onUnmounted(() => {
  chatGroupsUnmounted()
})
</script>

<style scoped src="../css/ChatGroups.css"></style>