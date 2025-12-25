# 图书商城 - Vue版

基于Vue 3 + Bootstrap 5 + PHP的现代化图书商城前端应用。

## 项目特性

- 🚀 **现代化前端**：使用Vue 3 + Vite构建，响应式设计
- 🎨 **美观界面**：基于Bootstrap 5的现代化UI设计
- 📱 **响应式布局**：完美适配桌面端和移动端
- 🔐 **用户认证**：完整的登录/注册系统
- 📚 **图书管理**：图书浏览、搜索、分类功能
- 🛒 **购物车**：添加商品到购物车
- ❤️ **收藏功能**：图书收藏管理
- 🔄 **实时交互**：前后端分离，API驱动
- 🖼️ **轮播图展示**：首页轮播图，支持自动切换和手动控制
- 🔘 **指示器导航**：轮播图指示器，支持点击切换

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Axios (HTTP客户端)
- Bootstrap 5
- Font Awesome (图标)
- Vite (构建工具)

### 后端
- PHP 7.4+
- MySQL数据库
- 原生PHP API接口

## 项目结构

```
client-book-vue/
├── src/                    # 前端源代码
│   ├── components/         # Vue组件
│   ├── views/             # 页面视图
│   ├── js/                # JavaScript逻辑文件（已拆分）
│   ├── css/               # CSS样式文件（已拆分）
│   ├── services/          # API服务
│   ├── router/            # 路由配置
│   └── main.js            # 应用入口
├── api/                   # PHP API接口
│   └── index.php          # API入口文件
├── public/                # 静态资源
├── package.json           # 项目配置
├── vite.config.js         # Vite配置
└── README.md              # 项目说明
```

## 功能模块

### 页面功能
- **首页**：图书搜索、分类筛选、分页浏览
- **分类浏览**：按图书分类浏览
- **新书推荐**：最新上架图书
- **畅销排行**：热门图书排行
- **个人中心**：用户信息管理
- **登录/注册**：用户认证
- **书声漫谈**：聊天室功能（Vue、JS、CSS已拆分）

### 核心功能
- 图书搜索（按书名、作者、分类）
- 图书详情展示
- 加入购物车
- 收藏管理
- 用户认证
- 响应式布局
- 首页轮播图展示
- 轮播图自动切换
- 指示器导航控制
- 左右切换按钮

## 安装和运行

### 环境要求
- Node.js 16+
- PHP 7.4+
- MySQL 5.7+

### 前端安装

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

### 后端配置

1. 确保原项目的数据库连接正常
2. API接口已配置在 `api/index.php`
3. 访问地址：`http://localhost/client-book-vue/`

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/check` - 检查登录状态
- `POST /api/auth/logout` - 用户退出

### 图书接口
- `GET /api/books` - 获取图书列表（支持搜索和分页）
- `GET /api/books/new` - 获取新书推荐
- `GET /api/books/bestsellers` - 获取畅销排行

### 分类接口
- `GET /api/categories` - 获取分类列表

### 用户接口
- `GET /api/user/profile` - 获取用户信息

### 购物车接口
- `POST /api/cart/add` - 添加到购物车

### 收藏接口
- `POST /api/wishlist/toggle` - 切换收藏状态

### 聊天室接口
- `GET /api/chat/groups` - 获取聊天群组列表
- `POST /api/chat/groups` - 创建聊天群组
- `GET /api/chat/messages` - 获取聊天消息
- `POST /api/chat/messages` - 发送聊天消息

## 文件结构优化

### 代码分离策略
项目已采用模块化设计，将大型页面的代码进行拆分：

**书声漫谈页面（ChatGroups.vue）拆分结构：**
```
src/
├── views/
│   └── ChatGroups.vue          # Vue模板文件（仅包含模板结构）
├── js/
│   └── ChatGroups.js           # JavaScript逻辑文件（1600+行业务逻辑）
└── css/
    └── ChatGroups.css          # CSS样式文件（1800+行样式规则）
```

### 拆分优势
- **代码分离**：Vue、JS、CSS完全分离，便于维护
- **模块化**：JavaScript逻辑封装为可复用的模块
- **职责单一**：每个文件职责明确，便于团队协作
- **易于扩展**：可以独立修改样式或逻辑而不影响其他部分

## 开发说明

### 项目特点
1. **前后端分离**：前端使用Vue SPA，后端提供RESTful API
2. **组件化开发**：基于Vue 3 Composition API
3. **响应式设计**：使用Bootstrap 5网格系统
4. **现代化构建**：使用Vite进行快速开发和构建

### 数据库连接
项目使用独立的数据库连接配置，配置文件位于：
- `api/db_connect.php`

数据库配置信息：
- 主机：`localhost`
- 数据库名：`book_db`
- 用户名：`root`
- 密码：`root`（请根据实际环境修改）

### 部署说明

#### 传统部署
1. 构建前端：`npm run build`
2. 将dist目录内容部署到Web服务器
3. 确保API接口可正常访问

#### Vercel部署（推荐）
1. 将项目推送到GitHub仓库
2. 访问 [Vercel](https://vercel.com) 并登录
3. 导入GitHub仓库
4. 配置构建设置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 添加环境变量（如需要）：
   - VITE_API_BASE_URL: 后端API地址
6. 点击部署，获取访问链接

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License