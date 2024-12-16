import { defineStore } from "pinia"
import { ref } from "vue"
import { menuRouter } from "@/routers/modules/staticRouter.ts"
import * as AuthAPI from "@/api/auth/index.ts"

export const useAuthStore = defineStore("auth", () => {
  // 白名单路由
  const allowRouteList: string[] = ["Login", "Dashboard", "Notice", "403", "404"]
  // 页面权限列表
  const authList = ref<any[]>([])
  // 菜单列表
  const menuList = ref<any[]>([])
  // 项目菜单列表
  const projectMenuList = ref<any[]>([])
  // 按钮权限列表
  const btnList = ref<any>({})
  // 账号信息
  const userInfo = ref<any>({})

  // 获取当前登录账号权限
  function getPermission() {
    return AuthAPI.getPermission().then((res: any) => {
      // 保存权限列表
      authList.value = res.data.data
      // 生成菜单列表
      menuList.value = handleMenuList(menuRouter, authList.value)
    })
  }

  // 获取当前登录账号信息
  function getUserInfo() {
    return AuthAPI.getUserInfo().then((res: any) => {
      // 保存账号信息
      userInfo.value = res.data.data
    })
  }

  // 生成菜单列表
  function handleMenuList(router: any, authList: any) {
    let newRouter: any = []

    router.forEach((item: any) => {
      if (item.children) {
        const childrenRouter = handleMenuList(item.children, authList)
        if (childrenRouter.length > 0) {
          newRouter.push({ ...item, children: childrenRouter })
        }
      } else {
        authList.forEach((auth: any) => {
          if (auth.code === item.meta.code && auth.r) {
            newRouter.push(item)

            // 如果路由 path 包含 project/detail/ 则添加到项目菜单列表
            if (item.path.includes("/project/detail/")) {
              projectMenuList.value.push(item)
            }
          }
        })
      }
    })

    return newRouter
  }

  // 生成按钮权限
  function handleBtnList(currentRoute: any) {
    authList.value.some((item: any) => {
      if (item.code == currentRoute.meta.code) {
        // 按钮权限【增/删/改/查/导出】
        btnList.value = {
          isAdd: item.c,
          isDelete: item.d,
          isUpdate: item.u,
          isQuery: item.r,
          isExport: item.e
        }

        /**
         * 特殊处理：
         * 后端权限接口将【进项管理、销项管理】里面的【走款、收款、回款】相关权限拆分出来，
         * 需要单独判断，无法直接赋值
         */
        switch (currentRoute.meta.code) {
          // 进项管理：获取走款、回款按钮权限
          case "incomeBase":
            authList.value.forEach((items: any) => {
              if (items.code == "incomeGone") {
                btnList.value.gone = {
                  isAdd: items.c,
                  isDelete: items.d,
                  isUpdate: items.u,
                  isQuery: items.r,
                  isExport: items.e
                }
              }
              if (items.code == "incomeBack") {
                btnList.value.back = {
                  isAdd: items.c,
                  isDelete: items.d,
                  isUpdate: items.u,
                  isQuery: items.r,
                  isExport: items.e
                }
              }
            })
            break

          // 销项管理：获取走款、收款按钮权限
          case "outputBase":
            authList.value.forEach((items: any) => {
              if (items.code == "outputGone") {
                btnList.value.gone = {
                  isAdd: items.c,
                  isDelete: items.d,
                  isUpdate: items.u,
                  isQuery: items.r,
                  isExport: items.e
                }
              }
              if (items.code == "outputProceeds") {
                btnList.value.proceed = {
                  isAdd: items.c,
                  isDelete: items.d,
                  isUpdate: items.u,
                  isQuery: items.r,
                  isExport: items.e
                }
              }
            })
            break
        }

        // 终止遍历
        return true
      }
    })
  }

  return {
    allowRouteList,
    authList,
    menuList,
    projectMenuList,
    btnList,
    userInfo,
    getPermission,
    getUserInfo,
    handleBtnList
  }
})

export default useAuthStore
