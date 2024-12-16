//进项管理
import request from "@/utils/request.ts"
//进项：依据项目ID查询基本信息
export const getByProjectId = (params: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeBase/getByProjectId",
    params
  })
}
//进项：依据ID查询基本信息 详细
export const getOne = (id: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeBase/getOne",
    params: { id: id }
  })
}
//进项回款：依据进项ID查询回款信息列表 收票历史
export const addIncome = (data: any) => {
  return request({
    method: "POST",
    url: "/project/income/incomeBase/add",
    data
  })
}
//进项：修改基本信息
export const updateIncome = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/income/incomeBase/update",
    data
  })
}
///进项：删除基本信息
export const deleteIncome = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/income/incomeBase/delete",
    params: { id: id }
  })
}

// 下载文件 基本信息
export const download = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/income/incomeBase/download/" + path,
    params: { name }
  })
}

//进项走款：依据进项ID查询走款信息列表
export const getByIncomeIdGone = (params: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeGone/getByIncomeId",
    params
  })
}
//进项走款：添加走款信息
export const addGone = (data: any) => {
  return request({
    method: "POST",
    url: "/project/income/incomeGone/add",
    data
  })
}
//进项走款：下载附件
export const downloadGone = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/income/incomeGone/download/" + path,
    params: { name }
  })
}
//进项走款：依据ID查询走款信息详细
export const getOneGone = (id: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeGone/getOne",
    params: { id: id }
  })
}
//进项走款：修改走款信息
export const updateIncomeGone = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/income/incomeGone/update",
    data
  })
}

//进项走款：删除走款信息
export const deleteIncomeGone = (id: any) => {
  return request({
    method: "DELETE",
    url: "/project/income/incomeGone/delete",
    params: { id: id }
  })
}

//进项回款：依据进项ID查询回款信息列表
export const getByIncomeIdBack = (params: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeBack/getByIncomeId",
    params
  })
}

//进项回款：依据进项ID查询回款信息详细
export const getOneBack = (id: any) => {
  return request({
    method: "get",
    url: "/project/income/incomeBack/getOne",
    params: { id: id }
  })
}
//进项回款：添加回款信息
export const addIncomeBack = (data: any) => {
  return request({
    method: "POST",
    url: "/project/income/incomeBack/add",
    data
  })
}

//进项回款：下载附件
export const downloadIncomeBack = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/income/incomeBack/download/" + path,
    params: { name }
  })
}
//进项回款：修改回款信息
export const updateIncomeBack = (data: any) => {
  return request({
    method: "PUT",
    url: "/project/income/incomeBack/update",
    data
  })
}
//进项回款：删除回款信息
export const deleteIncomeBack = (id: any) => {
  return request({
    method: "DELETE",
    url: "/project/income/incomeBack/delete",
    params: { id: id }
  })
}
