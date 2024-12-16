// 甲方回款 - 接口配置
import request from "@/utils/request.ts"

//甲方：依据项目编号查询甲方回款统计信息
export const getSumByProjectId = (id: string) => {
  return request({
    method: "get",
    url: "/project/constructionReturned/getSumByProjectId",
    params: { projectId: id }
  })
}

//甲方：依据项目编号查询甲方回款信息 列表
export const getByProjectId = (params: any) => {
  return request({
    method: "get",
    url: "/project/constructionReturned/getByProjectId",
    params
  })
}
//甲方：依据ID查询甲方回款信息 详细
export const getOne = (id: string) => {
  return request({
    method: "get",
    url: "/project/constructionReturned/getOne",
    params: { id: id }
  })
}
//甲方：添加甲方回款信息
export const addCollect = (data: any) => {
  return request({
    method: "POST",
    url: "/project/constructionReturned/add",
    data
  })
}
// 下载文件
export const download = (path: any, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/constructionReturned/download/" + path,
    params: { name }
  })
}

// 甲方：修改甲方回款信息
export const updateCollect = (data: any) => {
  return request({
    method: "put",
    url: "/project/constructionReturned/update",
    data
  })
}

//甲方：删除甲方回款信息
export const deleteCollect = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/constructionReturned/delete",
    params: { id: id }
  })
}
