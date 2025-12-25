import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import NewBooks from '../views/NewBooks.vue'
import Bestsellers from '../views/Bestsellers.vue'
import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import BookDetail from '../views/BookDetail.vue'
import Cart from '../views/Cart.vue'
import Wishlist from '../views/Wishlist.vue'
import Orders from '../views/Orders.vue'
import OrderDetail from '../views/OrderDetail.vue'
import OrderConfirm from '../views/OrderConfirm.vue'
import ChatGroups from '../views/ChatGroups.vue'
import Addresses from '../views/Addresses.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/new-books',
    name: 'NewBooks',
    component: NewBooks
  },
  {
    path: '/bestsellers',
    name: 'Bestsellers',
    component: Bestsellers
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: BookDetail
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail
  },
  {
    path: '/orders/:id/confirm',
    name: 'OrderConfirm',
    component: OrderConfirm
  },
  {
    path: '/chat-groups',
    name: 'ChatGroups',
    component: ChatGroups
  },
  {
    path: '/addresses',
    name: 'Addresses',
    component: Addresses
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router