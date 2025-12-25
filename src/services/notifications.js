// 通知管理服务
class NotificationService {
  constructor() {
    this.permission = 'default'
    this.init()
  }

  // 初始化通知服务
  init() {
    // 检查浏览器是否支持通知
    if ('Notification' in window) {
      this.permission = Notification.permission
    } else {
      console.warn('此浏览器不支持桌面通知功能')
    }
  }

  // 请求通知权限
  async requestPermission() {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }

  // 显示通知
  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission !== 'granted') {
      return false
    }

    // 设置默认选项
    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false
    }

    const notificationOptions = { ...defaultOptions, ...options }

    try {
      const notification = new Notification(title, notificationOptions)

      // 自动关闭通知
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // 点击通知时聚焦到窗口
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    } catch (error) {
      console.error('显示通知失败:', error)
      return false
    }
  }

  // 检查是否有通知权限
  hasPermission() {
    return this.permission === 'granted'
  }
}

// 创建全局通知服务实例
export const notificationService = new NotificationService()

// 设置相关的API调用
export const settingsApi = {
  // 更新用户设置到服务器
  async updateUserSettings(settings) {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('更新用户设置失败:', error)
      throw error
    }
  },

  // 从服务器获取用户设置
  async getUserSettings() {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取用户设置失败:', error)
      throw error
    }
  }
}

// 应用设置的工具函数
export const applySettings = (settings) => {
  // 应用隐私设置
  if (settings.showOnlineStatus !== undefined) {
    // 控制自己的在线状态对其他人的可见性
    // 当设置为false时，发送离线状态到服务器
    updateOnlineStatusVisibility(settings.showOnlineStatus)
  }

  // 应用通知设置
  if (settings.desktopNotification && !notificationService.hasPermission()) {
    // 如果用户开启了桌面通知但没有权限，请求权限
    notificationService.requestPermission()
  }

  // 返回设置以便其他地方使用
  return settings
}

// 更新在线状态可见性到服务器
const updateOnlineStatusVisibility = async (isVisible) => {
  try {
    const response = await fetch('/api/user/online-status-visibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ isVisible })
    })
    
    if (!response.ok) {
      console.error('更新在线状态可见性失败')
    }
  } catch (error) {
    console.error('更新在线状态可见性失败:', error)
  }
}

// 显示通知的统一函数
export const showNotification = (title, body, type = 'info', settings = {}) => {
  // 如果没有提供设置，使用默认值
  const defaultSettings = {
    notifyFriendMessages: true,
    notifyGroupMessages: true,
    notifyRequests: true,
    desktopNotification: false
  }
  
  const finalSettings = { ...defaultSettings, ...settings }
  
  // 根据设置和类型决定是否显示通知
  if (type === 'friend_message' && !finalSettings.notifyFriendMessages) {
    console.log(`好友消息通知已关闭: ${title}: ${body}`)
    return false
  }
  
  if (type === 'group_message' && !finalSettings.notifyGroupMessages) {
    console.log(`群聊消息通知已关闭: ${title}: ${body}`)
    return false
  }
  
  if (type === 'request' && !finalSettings.notifyRequests) {
    console.log(`申请通知已关闭: ${title}: ${body}`)
    return false
  }

  // 如果关闭了桌面通知或者没有权限，使用控制台通知作为备选
  if (!finalSettings.desktopNotification || !notificationService.hasPermission()) {
    // 使用控制台通知或其他备选方案
    console.log(`[${type.toUpperCase()}] ${title}: ${body}`)
    return false
  }

  // 显示桌面通知
  try {
    return notificationService.showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: type, // 用于防止重复通知
      renotify: true
    })
  } catch (error) {
    console.error('显示桌面通知失败:', error)
    console.log(`[${type.toUpperCase()}] ${title}: ${body}`)
    return false
  }
}