import { createRouter, createWebHistory } from "vue-router"
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router"
import { staticRouter, menuRouter, errorRouter } from "./modules/staticRouter"
import useGlobalStore from "@/stores/modules/global.ts"
import useAuthStore from "@/stores/modules/auth.ts"
import useProjectStore from "@/stores/modules/project.ts"

const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRouter, ...menuRouter, ...errorRouter]
})

// 路由守卫
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 1、页面标题
  document.title = `${to.meta.title} - 项目管理平台`

  // 2、判断有无 token，没有跳转登录页
  if (!localStorage.engineeringToken) {
    return to.path == "/login" ? next() : next("/login")
  }

  // 3、有 token 判断是否访问登录页，重定向到首页
  if (to.path == "/login") {
    return next("/")
  }

  // 4、判断是否已检测设备类型，没有执行检测
  const globalStore = useGlobalStore()
  if (globalStore.isMobile == null) {
    globalStore.checkIsMobile()
  }

  // 5、判断有无权限列表，没有重新获取
  const authStore = useAuthStore()
  const authList = authStore.authList
  if (!authList.length) {
    await authStore.getUserInfo()
    await authStore.getPermission()

    return next({ ...to, replace: true })
  }

  // 6、判断是否白名单路由
  const allowRouteList = authStore.allowRouteList
  if (allowRouteList.some((item: any) => item == to.name)) {
    return next()
  }

  // 7、判断是否拥有访问权限，没有跳转 403
  if (!authList.some((item: any) => item.code == to.meta.code)) {
    return next("/403")
  }

  // 8、判断有无项目类型，没有重新获取
  const projectStore = useProjectStore()
  if (!projectStore.isProjectTypeAll) {
    await projectStore.getProjectTypeAll()
  }

  // 9、判断是否跳转 项目详细 页面
  if (to.path.includes("project/detail")) {
    // 判断有无 项目ID，没有跳转项目列表页
    if (!sessionStorage.projectId) {
      return next("/project/list")
    } else if (!Object.keys(projectStore.info).length) {
      // 判断有无项目信息，没有重新获取
      await projectStore.getProjectInfo()
    }
  }

  // 8、生成当前页面按钮权限
  authStore.handleBtnList(to)

  next()
})

export default router
