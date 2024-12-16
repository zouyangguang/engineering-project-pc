/* 权限 - 接口 */
import request from "@/utils/request.ts"

// 登录
export const login = (data: any) => {
  return request({
    method: "post",
    url: "/login",
    data
  })
}

// 登出
export const logout = () => {
  return request({
    method: "post",
    url: "/logout"
  })
}

// 获取当前登录账号权限
export const getPermission = () => {
  return request({
    method: "get",
    url: "/getPermissions"
  })
}

// 获取当前登录账号信息
export const getUserInfo = () => {
  return request({
    method: "get",
    url: "/getAccountInfo"
  })
}

// 修改密码
export const updatePwd = (data: any) => {
  return request({
    method: "put",
    url: "/base/employee/updateToChangeOwnerPassword",
    data
  })
}
