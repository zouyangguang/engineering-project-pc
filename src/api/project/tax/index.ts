//缴税管理
import request from "@/utils/request.ts"
import useProjectStore from "../../../stores/modules/project.ts"

//开票：依据项目ID查询开票信息 开票历史列表
export const getByProjectId = (params: any) => {
  return request({
    method: "get",
    url: "/project/tax/getByProjectId",
    params
  })
}

//纳税管理：查询纳税类型
export const getTypes = () => {
  return request({
    method: "get",
    url: "/project/tax/getTypes"
  })
}

///工程实施：根据ID查询工程实施信息 详细
export const getOne = (id: string) => {
  return request({
    method: "get",
    url: "/project/tax/getOne",
    params: { id: id }
  })
}

//纳税：下载附件
export const download = (path: string, name: string) => {
  return request({
    method: "GET",
    responseType: "blob",
    url: "/project/tax/download/" + path,
    params: { name }
  })
}

//纳税管理：添加纳税信息
export const addTax = (data: any) => {
  return request({
    method: "POST",
    url: "/project/tax/add",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

//工程实施：修改纳税信息
export const updateTax = (data: any) => {
  return request({
    method: "put",
    url: "/project/tax/update",
    data
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}

//纳税管理：删除纳税信息
export const deleteTax = (id: string) => {
  return request({
    method: "DELETE",
    url: "/project/tax/delete",
    params: { id: id }
  }).then(() => {
    // 更新项目信息
    const projectStore = useProjectStore()
    projectStore.getProjectInfo()
  })
}
