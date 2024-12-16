/* 员工管理 - 接口 */
import request from "@/utils/request.ts"
import type { SearchFormInter } from "./types"

// 获取员工列表
export const getStaffList = (parm: SearchFormInter, page?: any) => {
  const params = {
    name: parm.name, // 员工姓名
    departId: parm.departId, // 部门ID
    roleId: parm.roleId, // 岗位ID
    startEntryDateTime: parm.entryDate && parm.entryDate[0], // 入职开始时间
    endEntryDateTime: parm.entryDate && parm.entryDate[1], // 入职结束时间
    page: page.current, // 当前页数
    size: page.pagesize // 每页显示条数
  }

  return request({
    method: "get",
    url: "/base/employee/getCondition",
    params
  })
}

// 获取员工详情
export const getStaffDetail = (id: number) => {
  return request({
    method: "get",
    url: "/base/employee/getOne",
    params: { id }
  })
}

// 添加员工
export const addStaff = (data: any) => {
  return request({
    method: "post",
    url: "/base/employee/add",
    data
  })
}

// 修改员工
export const updateStaff = (data: any) => {
  return request({
    method: "put",
    url: "/base/employee/update",
    data
  })
}

// 删除员工
export const deleteStaff = (id: number) => {
  return request({
    method: "delete",
    url: "/base/employee/delete",
    params: { id }
  })
}

// 工作交接
export const handoverStaff = (data: any) => {
  return request({
    method: "put",
    url: "/base/employee/updateToHandover",
    data
  })
}

// 员工离职
export const dismissStaff = (id: number) => {
  return request({
    method: "put",
    url: "/base/employee/updateToDismiss",
    params: { id }
  })
}

// 重置密码
export const resetPassword = (id: number) => {
  return request({
    method: "put",
    url: "/base/employee/updateToResetPassword",
    params: { id }
  })
}

// 批量迁移员工至新部门
export const transferStaff = (data: any) => {
  return request({
    method: "put",
    url: "/base/employee/updateToTransfer",
    data
  })
}
