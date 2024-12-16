/* 部门管理 - 接口 */
import request from "@/utils/request.ts"
import type { DeptFormInter, transferDeptFormInter } from "./types"

// 获取部门列表
export const getDeptList = () => {
  return request({
    method: "get",
    url: "/base/depart/getAll"
  })
}

// 获取子部门列表
export const getDeptSonList = (id: number) => {
  return request({
    method: "get",
    url: "/base/depart/getChildren",
    params: { parentId: id }
  })
}

// 获取部门详情
export const getDeptDetail = (id: number) => {
  return request({
    method: "get",
    url: "/base/depart/getOne",
    params: { id }
  })
}

// 获取部门旗下员工数量
export const getDeptStaffTotal = (id: number) => {
  return request({
    method: "get",
    url: "/base/depart/getEmployeeCountByDepartId",
    params: { id }
  })
}

// 添加部门
export const addDept = (data: DeptFormInter) => {
  return request({
    method: "post",
    url: "/base/depart/add",
    data
  })
}

// 修改部门
export const updateDept = (data: DeptFormInter) => {
  return request({
    method: "put",
    url: "/base/depart/update",
    data
  })
}

// 迁移 & 删除部门（仅传 ID 直接删除）
export const deleteDept = (params: transferDeptFormInter) => {
  return request({
    method: "delete",
    url: "/base/depart/delete",
    params
  })
}
