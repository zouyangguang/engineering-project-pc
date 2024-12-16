/* 布局 hook */

import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import * as AuthAPI from "@/api/auth/index.ts"

export function useLayouts() {
  //【实例】当前路由
  const route = useRoute()
  //【实例】路由
  const router = useRouter()
  //【变量】当前选中路由
  const activeRoute = ref<string>(route.path)
  //【变量】当前路径列表
  const routesList = ref(route.matched)

  // 监听路由变化
  watch(
    route,
    newVal => {
      // 更新当前路由；当路由地址为项目详情时，更新为项目列表（用于菜单高亮显示）
      activeRoute.value = newVal.path.includes("/project/detail") ? "/project/list" : newVal.path

      // 更新路径列表
      routesList.value = newVal.matched
    },
    {
      deep: true,
      immediate: true
    }
  )

  //【方法】路由跳转
  function routeGo(path: string) {
    router.push(path)
  }

  //【方法】退出登录
  function logout() {
    AuthAPI.logout().then(() => {
      // 清空缓存
      sessionStorage.clear()
      // 删除 token
      localStorage.removeItem("engineeringToken")
      // 刷新页面
      location.reload()
    })
  }

  return {
    activeRoute,
    routesList,
    routeGo,
    logout
  }
}
