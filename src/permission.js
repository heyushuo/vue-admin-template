import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // 缓存中查看用户是否处于登录状态
import getPageTitle from '@/utils/get-page-title'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
const whiteList = ['/login'] // no redirect whitelist
router.beforeEach(async(to, from, next) => {
  // 导航进度条开始
  NProgress.start()
  // 设置title
  document.title = getPageTitle(to.meta.title)
  // 查看是否登录
  const hasToken = getToken()
  if (hasToken) {
    // 登录状态
    if (to.path === '/login') {
      // 如果登录状态直接跳转到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo')
          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 未登录状态
    if (whiteList.indexOf(to.path) !== -1) {
      // 白名单 不用登录就能进入
      next()
    } else {
      // 其他无权访问的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})
router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
