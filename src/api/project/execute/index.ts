//工程实施
import request from "@/utils/request.ts"
//工程实施：根据项目编号查询工程实施信息 列表
export const getByProjectId = (params: any) => {
  return request({
    method: "get",
    url: "/project/constructionImpl/getByProjectId",
    params
  })
}

// 获取工程实施汇总信息
export const getExecuteSumAPI = (projectId: number) => {
  return request({
    method: "get",
    url: "/project/constructionImpl/getSumByProjectId",
    params: { projectId }
  })
}

//工程实施：添加工程实施信息
export const addExecute = (data: any) => {
  return request({
    method: "POST",
    url: "/project/constructionImpl/add",
    data
  })
}

// 下载文件
export const download = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/constructionImpl/download/" + path,
    params: { name }
  })
}
///甲方：查询甲方回款单 所以
export const getReceipts = (projectId: string) => {
  return request({
    method: "get",
    url: "/project/constructionReturned/getReceipts",
    params: { projectId: projectId }
  })
}

//工程实施：工程实施团队类型
export const getTeamType = () => {
  return request({
    method: "get",
    url: "/project/constructionImpl/getTeamType"
  })
}

///工程实施：根据ID查询工程实施信息 详细
export const getOne = (id: string) => {
  return request({
    method: "get",
    url: "/project/constructionImpl/getOne",
    params: { id: id }
  })
}

//工程实施：修改工程实施信息
export const updateExecute = (data: any) => {
  return request({
    method: "put",
    url: "/project/constructionImpl/update",
    data
  })
}

//工程实施：删除工程实施信息
export const deleteExecute = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/constructionImpl/delete",
    params: { id: id }
  })
}
