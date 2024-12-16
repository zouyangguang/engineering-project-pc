/* 岗位管理 - 接口 */
import request from "@/utils/request.ts"

// 获取岗位列表
export const getPostList = () => {
  return request({
    method: "get",
    url: "/base/role/getRoles"
  })
}

// 获取页面权限列表
export const getModuleList = () => {
  return request({
    method: "get",
    url: "/base/role/getModules"
  })
}

// 获取岗位详情
export const getPostDetail = (id: number) => {
  return request({
    method: "get",
    url: "/base/role/getOne",
    params: { id }
  })
}

// 添加岗位
export const addPost = (data: any) => {
  return request({
    method: "post",
    url: "/base/role/add",
    data
  })
}

// 修改岗位
export const updatePost = (data: any) => {
  return request({
    method: "put",
    url: "/base/role/update",
    data
  })
}

// 删除岗位
export const deletePost = (id: number) => {
  return request({
    method: "delete",
    url: "/base/role/delete",
    params: { id }
  })
}
